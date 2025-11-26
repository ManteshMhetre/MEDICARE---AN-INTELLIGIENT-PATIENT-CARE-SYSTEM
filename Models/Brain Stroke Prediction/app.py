from flask import Flask, render_template, request
import pandas as pd
import joblib
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.io as pio

app = Flask(__name__)

# Load the pre-trained model from joblib (adjust the file path as needed)
model = joblib.load('rf_model.pkl')

# Define mapping dictionaries (must match those used during training)
gender_mapping = {'Male': 0, 'Female': 1, 'Other': 2}
ever_married_mapping = {'No': 0, 'Yes': 1}
work_type_mapping = {'Private': 0, 'Self-employed': 1, 'Govt_job': 2, 'children': 3, 'Never_worked': 4}
residence_mapping = {'Urban': 0, 'Rural': 1}
smoking_status_mapping = {'never smoked': 0, 'formerly smoked': 1, 'smokes': 2, 'Unknown': 3}
hypertension_mapping = {'No': 0, 'Yes': 1}
heart_disease_mapping = {'No': 0, 'Yes': 1}
stroke_mapping = {0: "No", 1: "Yes"}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    # Retrieve user input from the form
    gender = request.form['gender']
    age = float(request.form['age'])
    hypertension = request.form['hypertension']
    heart_disease = request.form['heart_disease']
    ever_married = request.form['ever_married']
    work_type = request.form['work_type']
    residence = request.form['residence']
    avg_glucose_level = float(request.form['avg_glucose_level'])
    bmi = float(request.form['bmi'])
    smoking_status = request.form['smoking_status']

    # Convert categorical values using predefined mappings
    gender_enc = gender_mapping.get(gender)
    hypertension_enc = hypertension_mapping.get(hypertension)
    heart_disease_enc = heart_disease_mapping.get(heart_disease)
    ever_married_enc = ever_married_mapping.get(ever_married)
    work_type_enc = work_type_mapping.get(work_type)
    residence_enc = residence_mapping.get(residence)
    smoking_status_enc = smoking_status_mapping.get(smoking_status)

    # Prepare a DataFrame for prediction (one row)
    input_data = pd.DataFrame([{
        'gender': gender_enc,
        'age': age,
        'hypertension': hypertension_enc,
        'heart_disease': heart_disease_enc,
        'ever_married': ever_married_enc,
        'work_type': work_type_enc,
        'Residence_type': residence_enc,
        'avg_glucose_level': avg_glucose_level,
        'bmi': bmi,
        'smoking_status': smoking_status_enc
    }])

    # Predict stroke risk
    pred_numeric = model.predict(input_data)[0]
    prediction_label = stroke_mapping[pred_numeric]
    prediction_text = f"Predicted Stroke Risk: {prediction_label}"

    # --- Create Gauge Charts for four key features ---
    # We create four individual gauge indicators and arrange them in a 2x2 grid.
    fig = make_subplots(rows=2, cols=2,
                        specs=[[{'type': 'indicator'}, {'type': 'indicator'}],
                               [{'type': 'indicator'}, {'type': 'indicator'}]],
                        subplot_titles=("Age", "Avg Glucose Level", "BMI", "Smoking Status"))

    # Gauge for Age (example range: 0 to 100)
    fig.add_trace(go.Indicator(
        mode="gauge+number",
        value=age,
        gauge={'axis': {'range': [None, 100]}}
    ), row=1, col=1)

    # Gauge for Avg Glucose Level (example range: 0 to 300)
    fig.add_trace(go.Indicator(
        mode="gauge+number",
        value=avg_glucose_level,
        gauge={'axis': {'range': [None, 300]}}
    ), row=1, col=2)

    # Gauge for BMI (example range: 10 to 60)
    fig.add_trace(go.Indicator(
        mode="gauge+number",
        value=bmi,
        gauge={'axis': {'range': [None, 60]}}
    ), row=2, col=1)

    # Gauge for Smoking Status (encoded: 0-3; lower is "better")
    fig.add_trace(go.Indicator(
        mode="gauge+number",
        value=smoking_status_enc,
        gauge={'axis': {'range': [None, 3]},
               'bar': {'color': "darkorange"},
               'steps': [
                   {'range': [0, 1], 'color': "lightgreen"},
                   {'range': [1, 2], 'color': "yellow"},
                   {'range': [2, 3], 'color': "tomato"}
               ]}
    ), row=2, col=2)

    fig.update_layout(height=500, margin=dict(t=50, b=0, l=25, r=25))

    # Convert the Plotly figure to an HTML div string
    gauge_html = pio.to_html(fig, full_html=False, include_plotlyjs='cdn')

    return render_template('index.html', prediction_text=prediction_text, gauge_html=gauge_html)


if __name__ == '__main__':
    app.run(debug=True)
