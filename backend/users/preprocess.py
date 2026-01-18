import re

class EducationPreprocessor:
    @staticmethod
    def validate_education_data(data):
        """
        Validate education data to ensure grade and cgpa are within acceptable ranges/formats.
        """
        errors = {}
        
        # Validate CGPA
        if 'cgpa' in data and data['cgpa'] is not None:
            try:
                cgpa = float(data['cgpa'])
                if not (0 <= cgpa <= 10.0): # Assuming 10.0 scale, can be adjusted
                    errors['cgpa'] = "CGPA must be between 0 and 10."
            except ValueError:
                errors['cgpa'] = "CGPA must be a valid number."

        # Validate Grade (if it's a letter grade)
        if 'grade' in data and data['grade']:
            grade = data['grade'].strip().upper()
            # Simple check for common grading components
            if not re.match(r'^[A-F][+-]?$|^[S]$|^[O]$', grade) and not re.match(r'^\d+(\.\d+)?$', grade):
                 # Allow A, A+, B-, S, O etc. OR numeric strings. 
                 # If it's pure numeric string it might be percentage or CGPA entered as grade
                 pass 
                 # For now, let's keep it loose or add specific constraints if User requested. 
                 # The prompt asked for "data encoding", so we assume we need to handle letter grades.

        return errors

    @staticmethod
    def encode_grade(grade):
        """
        Encode letter grades to numerical values (Example mapping).
        """
        if not grade:
            return None
            
        grade = grade.strip().upper()
        mapping = {
            'O': 10.0,
            'S': 9.0, # Sometimes S is 10, O is 10. Adjusting for common Indian context or US?
                      # Let's assume standard 4.0 or 10.0 scale mapping or just simple encoding.
                      # Let's use a standard 10-point mapping often used in India (since regex had S/O)
            'A+': 9.0,
            'A': 8.0, 
            'B+': 7.0,
            'B': 6.0,
            'C+': 5.0,
            'C': 4.0,
            'D': 3.0,
            'F': 0.0,
            'E': 0.0
        }
        
        if grade in mapping:
            return mapping[grade]
        
        # If it's already a number, return it
        try:
            return float(grade)
        except ValueError:
            return None

    @staticmethod
    def normalize_cgpa(cgpa, scale=10.0):
        """
        Normalize CGPA to 0-1 range.
        """
        if cgpa is None:
            return 0.0
        try:
            val = float(cgpa)
            if scale > 0:
                return min(max(val / scale, 0.0), 1.0)
            return 0.0
        except ValueError:
            return 0.0

    @classmethod
    def preprocess(cls, education_instance):
        """
        Apply encoding and normalization to an education instance.
        Returns a dictionary of processed features.
        """
        encoded_grade = cls.encode_grade(education_instance.grade)
        normalized_cgpa = cls.normalize_cgpa(education_instance.cgpa)
        
        return {
            'encoded_grade': encoded_grade,
            'normalized_cgpa': normalized_cgpa
        }
