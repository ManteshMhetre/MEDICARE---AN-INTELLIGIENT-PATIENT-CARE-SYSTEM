from flask import Flask, render_template, request
import pandas as pd
import joblib
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.io as pio

app = Flask(__name__)

# Load the pre-trained heart disease model from joblib
model = joblib.load('rf_Heart_disease_model.pkl')

# Define mapping dictionaries (must match training)
sex_mapping = {'Male': 1, 'Female': 0}
chest_pain_mapping = {
    'Typical Angina': 0,
    'Atypical Angina': 1,
    'Non-anginal Pain': 2,
    'Asymptomatic': 3
}
fasting_blood_sugar_mapping = {'No': 0, 'Yes': 1}
restecg_mapping = {
    'Normal': 0,
    'ST-T Wave Abnormality': 1,
    'Left Ventricular Hypertrophy': 2
}
exang_mapping = {'No': 0, 'Yes': 1}
slope_mapping = {
    'Upsloping': 0,
    'Flat': 1,
    'Downsloping': 2
}
num_major_vessels_mapping = {'0': 0, '1': 1, '2': 2, '3': 3}
thal_mapping = {
    'Normal': 0,
    'Fixed Defect': 1,
    'Reversible Defect': 2
}

# For the target, the model outputs 0 for "No" and 1 for "Yes"
target_mapping = {0: "No", 1: "Yes"}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    # Retrieve user inputs from form
    age = float(request.form['age'])
    sex = request.form['sex']
    chest_pain = request.form['chest_pain_type']
    resting_bp = float(request.form['resting_bp'])
    cholestoral = float(request.form['cholestoral'])
    fasting_bs = request.form['fasting_blood_sugar']
    restecg = request.form['restecg']
    max_hr = float(request.form['max_hr'])
    exang = request.form['exang']
    oldpeak = float(request.form['oldpeak'])
    slope = request.form['slope']
    num_vessels = request.form['num_major_vessels']
    thal = request.form['thal']

    # Convert categorical inputs to numeric using mappings
    sex_enc = sex_mapping.get(sex)
    chest_pain_enc = chest_pain_mapping.get(chest_pain)
    fasting_bs_enc = fasting_blood_sugar_mapping.get(fasting_bs)
    restecg_enc = restecg_mapping.get(restecg)
    exang_enc = exang_mapping.get(exang)
    slope_enc = slope_mapping.get(slope)
    num_vessels_enc = num_major_vessels_mapping.get(num_vessels)
    thal_enc = thal_mapping.get(thal)

    # Prepare DataFrame for prediction (column names must match training)
    input_data = pd.DataFrame([{
        'age': age,
        'sex': sex_enc,
        'chest_pain_type': chest_pain_enc,
        'resting_bp': resting_bp,
        'cholestoral': cholestoral,
        'fasting_blood_sugar': fasting_bs_enc,
        'restecg': restecg_enc,
        'max_hr': max_hr,
        'exang': exang_enc,
        'oldpeak': oldpeak,
        'slope': slope_enc,
        'num_major_vessels': num_vessels_enc,
        'thal': thal_enc
    }])

    # Predict heart disease risk using the model
    pred_numeric = model.predict(input_data)[0]
    prediction_label = target_mapping[pred_numeric]
    prediction_text = f"Predicted Heart Disease: {prediction_label}"

    # Create a 2x2 grid of gauges WITHOUT subplot titles
    fig = make_subplots(
        rows=2, cols=2,
        specs=[[{'type': 'indicator'}, {'type': 'indicator'}],
               [{'type': 'indicator'}, {'type': 'indicator'}]],
        # Remove subplot_titles to avoid double headings
        # subplot_titles=["Age (years)", "Resting BP", "Cholestoral", "Max Heart Rate"]
    )

    # Gauge for Age (range: 0 to 100)
    fig.add_trace(
        go.Indicator(
            mode="gauge+number",
            value=age,
            title={'text': "Age (years)"},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "#3B82F6"}
            }
        ), row=1, col=1
    )

    # Gauge for Resting BP (range: 80 to 220)
    fig.add_trace(
        go.Indicator(
            mode="gauge+number",
            value=resting_bp,
            title={'text': "Resting BP (mm Hg)"},
            gauge={
                'axis': {'range': [80, 220]},
                'bar': {'color': "#10B981"}
            }
        ), row=1, col=2
    )

    # Gauge for Cholestoral (range: 100 to 600)
    fig.add_trace(
        go.Indicator(
            mode="gauge+number",
            value=cholestoral,
            title={'text': "Cholestoral (mg/dl)"},
            gauge={
                'axis': {'range': [100, 600]},
                'bar': {'color': "#F59E0B"}
            }
        ), row=2, col=1
    )

    # Gauge for Max Heart Rate (range: 60 to 220)
    fig.add_trace(
        go.Indicator(
            mode="gauge+number",
            value=max_hr,
            title={'text': "Max Heart Rate"},
            gauge={
                'axis': {'range': [60, 220]},
                'bar': {'color': "#EF4444"}
            }
        ), row=2, col=2
    )

    fig.update_layout(
        height=500,
        margin=dict(t=50, b=40, l=30, r=30),
    )

    gauge_html = pio.to_html(fig, full_html=False, include_plotlyjs='cdn')

    return render_template('index.html', prediction_text=prediction_text, gauge_html=gauge_html)


if __name__ == '__main__':
    app.run(debug=True)
