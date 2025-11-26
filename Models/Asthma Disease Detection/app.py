from flask import Flask, render_template, request
import numpy as np
from joblib import load

app = Flask(__name__)
model = load('rf_asthma_model_prediction.pkl')


def preprocess_inputs(tiredness, dry_cough, difficulty_breathing, sore_throat, pains, nasal_congestion, runny_nose,
                      age_group, gender):
    # Convert yes/no responses into binary values
    symptoms = [1 if symptom == 'Yes' else 0 for symptom in
                [tiredness, dry_cough, difficulty_breathing, sore_throat, pains, nasal_congestion, runny_nose]]

    # One-hot encoding for age groups
    age_0_9 = 1 if age_group == '0-9' else 0
    age_10_19 = 1 if age_group == '10-19' else 0
    age_20_24 = 1 if age_group == '20-24' else 0
    age_25_59 = 1 if age_group == '25-59' else 0
    age_60_plus = 1 if age_group == '60+' else 0

    # One-hot encoding for gender
    gender_female = 1 if gender == 'Female' else 0
    gender_male = 1 if gender == 'Male' else 0

    # Combine into one numpy array
    inputs = np.array(
        symptoms + [age_0_9, age_10_19, age_20_24, age_25_59, age_60_plus, gender_female, gender_male]).reshape(1, -1)
    return inputs


def predict_asthma(inputs):
    prediction = model.predict(inputs)[0]
    if prediction == 1:
        return "Mild Asthma"
    elif prediction == 2:
        return "Moderate Asthma"
    elif prediction == 3:
        return "No Asthma"
    else:
        return "Unknown"


@app.route("/", methods=["GET", "POST"])
def index():
    prediction = None
    if request.method == "POST":
        # Retrieve inputs from form
        tiredness = request.form.get("tiredness")
        dry_cough = request.form.get("dry_cough")
        difficulty_breathing = request.form.get("difficulty_breathing")
        sore_throat = request.form.get("sore_throat")
        pains = request.form.get("pains")
        nasal_congestion = request.form.get("nasal_congestion")
        runny_nose = request.form.get("runny_nose")
        age_group = request.form.get("age_group")
        gender = request.form.get("gender")

        # Preprocess and predict
        inputs = preprocess_inputs(tiredness, dry_cough, difficulty_breathing, sore_throat, pains, nasal_congestion,
                                   runny_nose, age_group, gender)
        prediction = predict_asthma(inputs)

    return render_template("index.html", prediction=prediction)


if __name__ == "__main__":
    app.run(debug=True)
