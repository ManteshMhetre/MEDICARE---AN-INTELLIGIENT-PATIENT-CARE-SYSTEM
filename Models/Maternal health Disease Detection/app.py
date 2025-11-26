from flask import Flask, render_template, request
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained XGBoost model
model_xgb = joblib.load('xgb_model.pkl')

def predict_risk_level(age, systolic_bp, diastolic_bp, bs, body_temp, heart_rate):
    # Create a DataFrame for the input data
    input_data = pd.DataFrame({
        'Age': [age],
        'SystolicBP': [systolic_bp],
        'DiastolicBP': [diastolic_bp],
        'BS': [bs],
        'BodyTemp': [body_temp],
        'HeartRate': [heart_rate]
    })

    # Predict using the loaded model
    prediction_proba = model_xgb.predict_proba(input_data)[0]

    # Determine risk level based on probability thresholds
    low_risk_threshold = 0.33
    mid_risk_threshold = 0.66

    if prediction_proba[2] > mid_risk_threshold:
        risk_level = 'High Maternal risk'
    elif prediction_proba[1] > low_risk_threshold:
        risk_level = 'Medium Maternal risk'
    else:
        risk_level = 'Low Maternal risk'

    return risk_level

@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    if request.method == "POST":
        # Retrieve form inputs
        age = int(request.form.get("age"))
        systolic_bp = int(request.form.get("systolic_bp"))
        diastolic_bp = int(request.form.get("diastolic_bp"))
        bs = float(request.form.get("bs"))
        body_temp = float(request.form.get("body_temp"))
        heart_rate = int(request.form.get("heart_rate"))

        # Get risk level prediction
        result = predict_risk_level(age, systolic_bp, diastolic_bp, bs, body_temp, heart_rate)

    return render_template("index.html", result=result)

if __name__ == "__main__":
    app.run(debug=True)
