import pandas as pd
import re

# 1. Load your raw dataset
df = pd.read_csv('india_insurance_500.csv')

# --- Helper Functions ---

def clean_premium(val):
    val = str(val).lower()
    # Remove non-numeric characters except for calc
    num_str = re.sub(r'[^\d]', '', val)
    if not num_str: return 0
    amount = int(num_str)
    
    # Convert monthly to yearly if needed
    if 'month' in val:
        return amount * 12
    return amount

def clean_type(val):
    val = str(val).strip()
    if val == 'Life - Term': return 'Term Life'
    if val == 'Life - Endowment': return 'Endowment'
    if 'Health' in val: return 'Health'
    return val

def clean_category(val, type_val):
    # Standardize to your App's categories: 'Protection', 'Family', 'Individual', 'Car', 'Investment'
    if type_val == 'Term Life': return 'Protection'
    if type_val == 'Motor': return 'Car' 
    if type_val == 'Endowment': return 'Investment'
    # Default Health to Individual (or Family if logic exists)
    return 'Individual'

def clean_features(val):
    if pd.isna(val): return ""
    # Ensure pipe separator for the JS importer
    return str(val).replace(';', '|')

def format_coverage(val):
    # Convert raw numbers like 10000000 to "1 Cr"
    val_str = str(val).replace('₹', '').replace(',', '').strip()
    try:
        amount = float(val_str)
        if amount >= 10000000:
            return f"{amount/10000000} Cr"
        if amount >= 100000:
            return f"{amount/100000} Lakhs"
        return val_str
    except:
        return val_str

# --- Apply Cleaning ---

df['premium'] = df['premium'].apply(clean_premium)
df['type'] = df['type'].apply(clean_type)
df['category'] = df.apply(lambda x: clean_category(x['category'], x['type']), axis=1)
df['features'] = df['features'].apply(clean_features)
df['coverage'] = df['coverage'].apply(format_coverage)

# Keep only necessary columns and rename if needed
df_final = df[['provider', 'plan_name', 'type', 'category', 'premium', 'coverage', 'term', 'features', 'badge']]

# 2. Save the Cleaned File
output_file = 'real_policies_cleaned.csv'
df_final.to_csv(output_file, index=False)

print(f"✅ Success! Cleaned data saved to {output_file}")
print(df_final.head())