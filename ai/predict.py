import pandas as pd
import numpy as np
import joblib
import os
import sys
import warnings
from datetime import timedelta, datetime
from tensorflow.keras.models import load_model

# --- FLASK SETUP ---
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- CONFIGURATION ---
# Silence TensorFlow Logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
warnings.filterwarnings('ignore')

# --- IMPORT LOCAL MODULES ---
# Ensure we can import from the same folder
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from train_models import process_data
    print("[SUCCESS] Imported process_data from train_models.py")
except ImportError as e:
    print(f"[ERROR] Could not import train_models.py: {e}")
    # We don't exit here so the server can try to start, 
    # but predictions might fail if this missing.

# --- GLOBAL VARIABLES ---
app = Flask(__name__)
CORS(app)
loaded_models = {}
COMPANIES = ['BPCL', 'HDBK', 'ICBK', 'INFY', 'ITC', 'MRF', 'RELI', 'SBI', 'TCS', 'VDAN']

# --- 1. LOAD MODELS ONCE (SPEED BOOST) ---
def preload_models():
    print("[INFO] Pre-loading AI Models for Instant Access...")
    count = 0
    for company in COMPANIES:
        try:
            # Look in current directory
            model_path = os.path.join(current_dir, f"{company}_model.h5")
            scaler_path = os.path.join(current_dir, f"{company}_scaler.pkl")

            if os.path.exists(model_path) and os.path.exists(scaler_path):
                loaded_models[company] = {
                    "model": load_model(model_path),
                    "scaler": joblib.load(scaler_path)
                }
                count += 1
                print(f"   OK: {company}")
            else:
                # Optional: Silent warning to keep logs clean
                pass 
        except Exception as e:
            print(f"   ERROR {company}: {e}")
    print(f"[SUCCESS] {count} Models Loaded. Server Ready.")

# --- 2. CORE PREDICTION FUNCTION ---
def generate_prediction(company, start_date_str, end_date_str):
    if company not in loaded_models:
        return {"error": f"Model for {company} not loaded. Check .h5 files."}

    model = loaded_models[company]['model']
    scaler = loaded_models[company]['scaler']

    # Load Data using your train_models logic
    file_name = f"{company} Historical Data.csv"
    try:
        # Try finding the file in current dir or 'data' subdir
        if os.path.exists(os.path.join(current_dir, 'data', file_name)):
            full_path = os.path.join(current_dir, 'data', file_name)
        elif os.path.exists(os.path.join(current_dir, file_name)):
            full_path = os.path.join(current_dir, file_name)
        else:
            return {"error": f"CSV {file_name} not found"}
            
        df = process_data(full_path)
    except Exception as e:
        return {"error": f"Data load failed: {str(e)}"}

    # Process Dates
    last_real_date = df['Date'].max()
    req_start = pd.to_datetime(start_date_str, dayfirst=True)
    req_end = pd.to_datetime(end_date_str, dayfirst=True)
    results = []

    # A. Historical
    if req_start <= last_real_date:
        mask = (df['Date'] >= req_start) & (df['Date'] <= req_end)
        # Use a copy to avoid SettingWithCopy warnings
        hist_slice = df.loc[mask].copy()
        for _, row in hist_slice.iterrows():
            results.append({
                'Date': row['Date'].strftime('%d-%m-%Y'),
                'Price': round(row['Close'], 2),
                'Type': 'Actual'
            })

    # B. Future Prediction (Your 7-feature Logic)
    if req_end > last_real_date:
        # Get last 60 days of features
        data_values = df.drop('Date', axis=1).values
        scaled_data = scaler.transform(data_values)
        
        if len(scaled_data) < 60:
             return {"error": "Not enough historical data (need 60 days)"}

        current_batch = scaled_data[-60:].reshape(1, 60, -1)
        num_features = current_batch.shape[2]

        current_pred_date = last_real_date + timedelta(days=1)
        
        while current_pred_date <= req_end:
            # Predict
            pred_scaled = model.predict(current_batch, verbose=0)[0][0]
            
            # Inverse Transform (Dummy row trick)
            dummy_row = np.zeros((1, num_features))
            dummy_row[0, 0] = pred_scaled 
            actual_price = scaler.inverse_transform(dummy_row)[0][0]

            if current_pred_date >= req_start:
                results.append({
                    'Date': current_pred_date.strftime('%d-%m-%Y'),
                    'Price': round(actual_price, 2),
                    'Type': 'Predicted'
                })

            # Update Batch
            new_row = current_batch[0, -1, :].copy()
            new_row[0] = pred_scaled
            new_row = new_row.reshape(1, 1, num_features)
            current_batch = np.append(current_batch[:, 1:, :], new_row, axis=1)
            current_pred_date += timedelta(days=1)

    return {"message": "Success", "data": results}

# --- 3. FLASK ROUTE (SERVER MODE) ---
@app.route('/predict', methods=['POST'])
def api_predict():
    data = request.json
    response = generate_prediction(
        data.get('company'), 
        data.get('startDate'), 
        data.get('endDate')
    )
    if "error" in response:
        # Print error to terminal for debugging
        print(f"[ERROR] {response['error']}")
        return jsonify(response), 400
    return jsonify(response)

# --- 4. MAIN ENTRY POINT ---
if __name__ == "__main__":
    # PRIORITY 1: Check if running as a Server (Node.js starts it this way)
    if "--server" in sys.argv:
        preload_models()
        print("[INFO] Starting Flask Server on Port 5002...")
        app.run(port=5002, debug=False)
        
    # PRIORITY 2: Check if running manually with CLI args (python predict.py BPCL ...)
    elif len(sys.argv) > 3:
        # Manual CLI Mode
        company = sys.argv[1]
        start = sys.argv[2]
        end = sys.argv[3]
        preload_models()
        print(generate_prediction(company, start, end))

    # PRIORITY 3: Interactive Mode (User just typed 'python predict.py')
    else:
        preload_models()
        print("\n--- Manual Prediction Mode ---")
        try:
            c = input("Company: ").strip()
            s = input("Start (DD-MM-YYYY): ").strip()
            e = input("End (DD-MM-YYYY): ").strip()
            print(generate_prediction(c, s, e))
        except KeyboardInterrupt:
            print("\nExiting...")