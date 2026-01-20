import pandas as pd
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from django.conf import settings

class CareerPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.mlb = MultiLabelBinarizer()
        self.is_trained = False
        self.df = None
        self._train_model()

    def _train_model(self):
        csv_path = os.path.join(settings.BASE_DIR, 'ml', 'career_data.csv')
        if not os.path.exists(csv_path):
            print("Dataset not found. Skipping training.")
            return

        self.df = pd.read_csv(csv_path)
        # Normalize skills in dataframe to lowercase to ensure consistency
        if 'skills' in self.df.columns:
            self.df['skills'] = self.df['skills'].astype(str).str.lower()
        
        # Validation
        val_df = self.df.copy()
        # Normalize headers to be case insensitive potentially, or just enforce strict
        if 'skills' not in val_df.columns or 'job_role' not in val_df.columns:
            raise ValueError("CSV must contain 'skills' and 'job_role' columns")
            
        # Preprocess: Skills are comma separated in 'Skills' column
        # Handle NaN
        val_df = val_df.dropna(subset=['skills', 'job_role'])
        
        X_raw = [str(skills).lower().split(',') for skills in val_df['skills']]
        y = val_df['job_role']

        # Determine all possible skills from dataset
        self.mlb.fit(X_raw)
        X = self.mlb.transform(X_raw)

        self.model.fit(X, y)
        self.is_trained = True

    def predict_roles(self, user_skills):
        if not self.is_trained:
            return []

        # Transform user skills
        # Filter out skills that model hasn't seen to avoid errors, or MLB handles it?
        # MLB ignores unknown classes in transform? No, it raises error usually unless strictly handled.
        # Actually MLB.transform expects iterable of iterables.
        
        # Better approach: Manually map to columns
        # But MLB is easier if we handle ignore.
        
        # Let's clean user skills
        user_skills_clean = [s.strip().lower() for s in user_skills]
        
        # MLB.set_params might not set unknown ignore.
        # Safe way: Only keep skills known to MLB
        known_skills = set(self.mlb.classes_)
        valid_skills = [s for s in user_skills_clean if s in known_skills]
        
        if not valid_skills:
            return [] # No relevant skills

        X_user = self.mlb.transform([valid_skills])
        
        # Get probabilities
        probs = self.model.predict_proba(X_user)[0]
        
        # Map class names to probabilities
        role_probs = dict(zip(self.model.classes_, probs))
        
        # Sort by probability
        sorted_roles = sorted(role_probs.items(), key=lambda item: item[1], reverse=True)
        
        top_3 = sorted_roles[:3]
        
        results = []
        for role, prob in top_3:
            if prob > 0: # Only include if there's some match
                # Determine missing skills (simple heuristic)
                # Find a row in DF with this role and compare skills
                # This is a bit naive for ML but works for simple feedback
                
                # Get all skills associated with this role in dataset
                role_rows = self.df[self.df['job_role'] == role]
                all_role_skills = set()
                for skills_str in role_rows['skills']:
                    all_role_skills.update(skills_str.split(','))
                
                missing = list(all_role_skills - set(user_skills_clean))
                # Limit missing skills to top 5 most common or just first few
                missing = missing[:5]

                results.append({
                    "role": role,
                    "match_percentage": round(prob * 100, 1),
                    "missing_skills": missing
                })
        
        return results
