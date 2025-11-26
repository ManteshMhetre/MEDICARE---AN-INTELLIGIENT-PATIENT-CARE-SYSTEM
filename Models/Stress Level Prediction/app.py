from flask import Flask, render_template, request
import pandas as pd
import joblib

app = Flask(__name__)

# Load your saved model (make sure the filename matches your saved file)
model = joblib.load('stress_model.pkl')

# Mapping for categorical variable: Gender.
# (Assuming model was trained with Male -> 0, Female -> 1)
gender_mapping = {'Male': 0, 'Female': 1}

# Mapping for predicted stress level (based on your LabelEncoder order)
# (For example, Low -> 0, High -> 1, Moderate -> 2)
stress_level_mapping = {0: 'Low', 1: 'High', 2: 'Moderate'}


@app.route("/", methods=["GET", "POST"])
def index():
    prediction = None
    if request.method == "POST":
        # Get inputs from form
        gender = request.form.get("gender")
        age = float(request.form.get("age"))
        heart_rate = float(request.form.get("heart_rate"))
        sleep_hours = float(request.form.get("sleep_hours"))

        # Convert categorical input
        gender_encoded = gender_mapping.get(gender, -1)

        # Create DataFrame for prediction
        input_data = pd.DataFrame({
            "Gender": [gender_encoded],
            "Age": [age],
            "HeartRate": [heart_rate],
            "SleepHours": [sleep_hours]
        })

        # Predict using your model
        pred = model.predict(input_data)
        # Convert numeric prediction to stress level category
        pred_int = int(pred[0])
        prediction = stress_level_mapping.get(pred_int, "Unknown")

    return render_template("index.html", prediction=prediction)


if __name__ == "__main__":
    app.run(debug=True)
