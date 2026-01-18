import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu2job_backend.settings')
django.setup()

from users.preprocess import EducationPreprocessor
from users.models import Education

def test_preprocessing():
    print("Testing Education Preprocessor...")
    
    # Test 1: Encode Grade
    print("\n--- Test 1: Grade Encoding ---")
    grades_to_test = ['A', 'B+', 'O', 'F', 'Invalid', '8.5']
    for g in grades_to_test:
        encoded = EducationPreprocessor.encode_grade(g)
        print(f"Grade: {g} -> Encoded: {encoded}")

    # Test 2: Normalize CGPA
    print("\n--- Test 2: CGPA Normalization ---")
    cgpas_to_test = [9.5, 8.0, 5.0, 10.0, 0.0, None, 11.0] # 11.0 should be capped or handled
    for c in cgpas_to_test:
        norm = EducationPreprocessor.normalize_cgpa(c)
        print(f"CGPA: {c} -> Normalized: {norm}")

    # Test 3: Validate Data
    print("\n--- Test 3: Data Validation ---")
    data_samples = [
        {'cgpa': 9.5, 'grade': 'A'},
        {'cgpa': 11.0, 'grade': 'Z'}, # Invalid
        {'cgpa': -1.0, 'grade': 'A'}  # Invalid
    ]
    for d in data_samples:
        errors = EducationPreprocessor.validate_education_data(d)
        if errors:
            print(f"Data: {d} -> Errors: {errors}")
        else:
            print(f"Data: {d} -> Valid")

    print("\nTests Completed.")

if __name__ == '__main__':
    test_preprocessing()
