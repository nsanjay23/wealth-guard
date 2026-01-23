from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os  # <--- IMPORT THIS

app = Flask(__name__)
current_folder = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_folder, 'insurance_model.pkl')

try:
    model = joblib.load(model_path)
    print(f"Model loaded successfully from: {model_path}")
except FileNotFoundError:
    print(f"ERROR: Model not found at {model_path}")
    print("DID YOU RUN 'train_model.py'?")
    exit(1)
    
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        # Expecting input: { "user": {...}, "policies": [...] }
        user = data['user']
        policies = data['policies']
        
        results = []
        
        # Create a DataFrame for batch prediction
        predict_data = []
        for p in policies:
            predict_data.append({
                'age': user['age'],
                'income': user['incomeRange'],
                'risk': user['riskAppetite'] or 'Balanced', # Default
                'type': p['type'],
                'premium': p['premium']
            })
            
        df = pd.DataFrame(predict_data)
        
        # Predict scores for all policies at once
        scores = model.predict(df)
        
        # Attach scores back to policy IDs
        for i, p in enumerate(policies):
            results.append({
                'id': p['id'],
                'matchScore': round(scores[i], 2)
            })
            
        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5003) # Running on port 5002