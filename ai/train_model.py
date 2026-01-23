import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# 1. Load Data
data = pd.read_csv('insurance_training_data.csv')
X = data.drop('score', axis=1)
y = data['score']

# 2. Preprocessing (Convert text to numbers)
categorical_features = ['income', 'risk', 'type']
numerical_features = ['age', 'premium']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', 'passthrough', numerical_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])

# 3. Create Pipeline (Preprocessing + Model)
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100))
])

# 4. Train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model.fit(X_train, y_train)

print(f"Model Training Accuracy: {model.score(X_test, y_test)}")

# 5. Save the brain
joblib.dump(model, 'insurance_model.pkl')
print("Model saved as insurance_model.pkl")