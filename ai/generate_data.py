import pandas as pd
import random

ages = list(range(18, 80))
incomes = ['<5L', '5-10L', '10-20L', '20-50L', '>50L']
risks = ['Low Cost', 'Balanced', 'High Cover']
policy_types = ['Term Life', 'Health', 'Motor']
premiums = [1200, 2200, 5000, 10000, 15000, 25000, 50000]

data = []

for _ in range(8000): # High sample size
    age = random.choice(ages)
    income = random.choice(incomes)
    risk = random.choice(risks)
    p_type = random.choice(policy_types)
    premium = random.choice(premiums)
    
    score = 50 # Start neutral

    # --- RULE 1: THE "SENIOR CITIZEN" NUCLEAR OPTION ---
    if age > 50:
        if p_type == 'Term Life':
            score -= 100  # KILL IT. Seniors rarely get new Term Life.
        elif p_type == 'Motor' and premium < 2000:
            score -= 50   # Seniors don't care about cheap bike insurance
        elif p_type == 'Health':
            score += 80   # BOOST IT. This is what they need.

    # --- RULE 2: THE "WEALTHY" OPTION ---
    if income == '>50L':
        if premium < 5000: 
            score -= 50   # Rich people don't buy dirt cheap plans
        if premium > 15000:
            score += 40   # They buy premium plans

    # --- RULE 3: THE "YOUNG BROKE" OPTION ---
    if age < 30 and income == '<5L':
        if premium > 10000:
            score -= 100  # KILL IT. Cannot afford.
        if p_type == 'Motor' or p_type == 'Term Life':
            score += 40   # Likely needs bike insurance or cheap term life

    # Clamp Score (0 to 100)
    score = max(0, min(100, score))
    
    data.append([age, income, risk, p_type, premium, score])

df = pd.DataFrame(data, columns=['age', 'income', 'risk', 'type', 'premium', 'score'])
df.to_csv('insurance_training_data.csv', index=False)
print("NUCLEAR synthetic data generated.")