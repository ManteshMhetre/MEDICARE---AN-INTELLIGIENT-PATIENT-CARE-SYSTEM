from flask import Flask, render_template, request, flash, redirect, url_for
import numpy as np
import pickle

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a strong secret key

def predict_disease(patient_data):
    """
    Predicts disease risks based on patient data.
    Loads pre-trained models and scalers, prepares features, and returns a risk dictionary.
    """
    try:
        # Load models
        heart_model = pickle.load(open('heart_rf_model.pkl', 'rb'))
        diabetes_model = pickle.load(open('diabetes_model.pkl', 'rb'))
        cirrhosis_model = pickle.load(open('cirrhosis_model.pkl', 'rb'))
        hep_c_model = pickle.load(open('hep_c_model.pkl', 'rb'))

        # Load scalers
        heart_scaler = pickle.load(open('heart_scaler.pkl', 'rb'))
        diabetes_scaler = pickle.load(open('diabetes_scaler.pkl', 'rb'))
        cirrhosis_scaler = pickle.load(open('cirrhosis_scaler.pkl', 'rb'))
        hep_c_scaler = pickle.load(open('hep_c_scaler.pkl', 'rb'))

        # Heart Disease Features
        heart_features = np.array([[
            patient_data.get('Age', 55),
            patient_data.get('Sex', 1),
            patient_data.get('cp', 0),
            patient_data.get('BP', 130),
            patient_data.get('Cholesterol', 200),
            patient_data.get('FBS', 0),
            patient_data.get('EKG', 0),
            patient_data.get('MaxHR', 150),
            patient_data.get('ExerciseAngina', 0),
            patient_data.get('STdepression', 0.0),
            patient_data.get('STslope', 0),
            patient_data.get('Vessels', 0),
            patient_data.get('Thallium', 2)
        ]])

        # Diabetes Features – only scaling Age
        diabetes_features = np.array([[
            1 if patient_data.get('Polyuria', 0) == 1 else 0,
            1 if patient_data.get('Polydipsia', 0) == 1 else 0,
            patient_data.get('Age', 55),  # Age will be scaled
            1 if patient_data.get('Gender', 'Male') == 'Male' else 0,
            1 if patient_data.get('partial_paresis', 0) == 1 else 0,
            1 if patient_data.get('sudden_weight_loss', 0) == 1 else 0,
            1 if patient_data.get('Irritability', 0) == 1 else 0,
            1 if patient_data.get('delayed_healing', 0) == 1 else 0,
            1 if patient_data.get('Alopecia', 0) == 1 else 0,
            1 if patient_data.get('Itching', 0) == 1 else 0
        ]])
        # Scale Age for diabetes
        age_scaled = diabetes_scaler.transform([[patient_data.get('Age', 55)]])
        diabetes_features[0, 2] = age_scaled[0, 0]

        # Cirrhosis Features
        cirrhosis_features = np.array([[
            patient_data.get('Bilirubin', 1.2),
            patient_data.get('Albumin', 3.8),
            patient_data.get('Copper', 80),
            patient_data.get('Alk_Phos', 70),
            patient_data.get('SGOT', 40),
            patient_data.get('Tryglicerides', 150),
            patient_data.get('Platelets', 250),
            patient_data.get('Prothrombin', 11),
            patient_data.get('Stage', 1),
            patient_data.get('Age', 55),
            patient_data.get('Sex', 1),
            patient_data.get('Ascites', 0),
            patient_data.get('Hepatomegaly', 0),
            patient_data.get('Spiders', 0),
            patient_data.get('Edema', 0)
        ]])

        # Hepatitis C Features
        hep_c_features = np.array([[
            patient_data.get('Age', 55),
            patient_data.get('Sex', 1),
            patient_data.get('ALB', 4.0),
            patient_data.get('ALP', 70),
            patient_data.get('ALT', 45),
            patient_data.get('AST', 38),
            patient_data.get('BIL', 0.8),
            patient_data.get('CHE', 8000),
            patient_data.get('CHOL', 180),
            patient_data.get('CREA', 0.9),
            patient_data.get('GGT', 30),
            patient_data.get('PROT', 7.0)
        ]])

        # Scale features
        heart_scaled = heart_scaler.transform(heart_features)
        cirrhosis_scaled = cirrhosis_scaler.transform(cirrhosis_features)
        hep_c_scaled = hep_c_scaler.transform(hep_c_features)

        # Get prediction probabilities
        heart_prob = heart_model.predict_proba(heart_scaled)[:, 1][0]
        diabetes_prob = diabetes_model.predict_proba(diabetes_features)[:, 1][0]
        cirrhosis_prob = cirrhosis_model.predict_proba(cirrhosis_scaled)[:, 1][0]
        hep_c_prob = hep_c_model.predict_proba(hep_c_scaled)[:, 1][0]

        # Compute overall risk score
        final_score = (
            (0.30 * heart_prob) +
            (0.25 * diabetes_prob) +
            (0.25 * cirrhosis_prob) +
            (0.20 * hep_c_prob)
        )

        return {
            'Heart Disease': {'Risk': 'High' if heart_prob > 0.5 else 'Low', 'Probability': round(heart_prob, 3)},
            'Diabetes': {'Risk': 'High' if diabetes_prob > 0.5 else 'Low', 'Probability': round(diabetes_prob, 3)},
            'Cirrhosis': {'Risk': 'High' if cirrhosis_prob > 0.5 else 'Low', 'Probability': round(cirrhosis_prob, 3)},
            'Hepatitis C': {'Risk': 'High' if hep_c_prob > 0.5 else 'Low', 'Probability': round(hep_c_prob, 3)},
            'Overall Risk Score': round(final_score, 3)
        }

    except Exception as e:
        raise Exception(f"Error in prediction: {str(e)}")

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    if request.method == 'POST':
        try:
            # Collect input parameters from the form
            patient_data = {
                # General / Heart Disease
                'Age': int(request.form.get('Age', 55)),
                'Sex': int(request.form.get('Sex', 1)),
                'cp': int(request.form.get('cp', 0)),
                'BP': float(request.form.get('BP', 130)),
                'Cholesterol': float(request.form.get('Cholesterol', 200)),
                'FBS': int(request.form.get('FBS', 0)),
                'EKG': int(request.form.get('EKG', 0)),
                'MaxHR': int(request.form.get('MaxHR', 150)),
                'ExerciseAngina': int(request.form.get('ExerciseAngina', 0)),
                'STdepression': float(request.form.get('STdepression', 0.0)),
                'STslope': int(request.form.get('STslope', 0)),
                'Vessels': int(request.form.get('Vessels', 0)),
                'Thallium': int(request.form.get('Thallium', 2)),

                # Diabetes
                'Polyuria': int(request.form.get('Polyuria', 0)),
                'Polydipsia': int(request.form.get('Polydipsia', 0)),
                'Gender': request.form.get('Gender', 'Male'),
                'partial_paresis': int(request.form.get('partial_paresis', 0)),
                'sudden_weight_loss': int(request.form.get('sudden_weight_loss', 0)),
                'Irritability': int(request.form.get('Irritability', 0)),
                'delayed_healing': int(request.form.get('delayed_healing', 0)),
                'Alopecia': int(request.form.get('Alopecia', 0)),
                'Itching': int(request.form.get('Itching', 0)),

                # Cirrhosis
                'Bilirubin': float(request.form.get('Bilirubin', 1.2)),
                'Albumin': float(request.form.get('Albumin', 3.8)),
                'Copper': float(request.form.get('Copper', 80)),
                'Alk_Phos': float(request.form.get('Alk_Phos', 70)),
                'SGOT': float(request.form.get('SGOT', 40)),
                'Tryglicerides': float(request.form.get('Tryglicerides', 150)),
                'Platelets': float(request.form.get('Platelets', 250)),
                'Prothrombin': float(request.form.get('Prothrombin', 11)),
                'Stage': int(request.form.get('Stage', 1)),
                'Ascites': int(request.form.get('Ascites', 0)),
                'Hepatomegaly': int(request.form.get('Hepatomegaly', 0)),
                'Spiders': int(request.form.get('Spiders', 0)),
                'Edema': int(request.form.get('Edema', 0)),

                # Hepatitis C
                'ALB': float(request.form.get('ALB', 4.0)),
                'ALP': float(request.form.get('ALP', 70)),
                'ALT': float(request.form.get('ALT', 45)),
                'AST': float(request.form.get('AST', 38)),
                'BIL': float(request.form.get('BIL_hep', 0.8)),  # To distinguish from cirrhosis bilirubin
                'CHE': float(request.form.get('CHE', 8000)),
                'CHOL': float(request.form.get('CHOL_hep', 180)),  # To distinguish from heart cholesterol
                'CREA': float(request.form.get('CREA', 0.9)),
                'GGT': float(request.form.get('GGT', 30)),
                'PROT': float(request.form.get('PROT_hep', 7.0))
            }

            # Get the prediction result
            result = predict_disease(patient_data)
        except Exception as e:
            flash(str(e))
    return render_template('index.html', result=result)

if __name__ == '__main__':
    app.run(debug=True, port=1234)
