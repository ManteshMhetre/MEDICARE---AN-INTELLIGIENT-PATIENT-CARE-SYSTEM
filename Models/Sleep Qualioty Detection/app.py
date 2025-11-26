from flask import Flask, render_template, request
import pandas as pd
import joblib

app = Flask(__name__)

# Load the trained model (make sure sdf.pkl is in the same directory)
model_final = joblib.load('sdf.pkl')

# Mapping dictionaries for categorical variables
gender_mapping = {'Male': 0, 'Female': 1}
occupation_mapping = {
    'Software Engineer': 0, 'Doctor': 1, 'Sales Representative': 2, 'Teacher': 3, 'Nurse': 4,
    'Engineer': 5, 'Accountant': 6, 'Scientist': 7, 'Lawyer': 8, 'Salesperson': 9, 'Manager': 10
}
bmi_category_mapping = {'Overweight': 0, 'Normal': 1, 'Obese': 2, 'Normal Weight': 3}
sleep_disorder_mapping = {'No disorder': 0, 'Sleep Apnea': 1, 'Insomnia': 2}

@app.route('/', methods=['GET', 'POST'])
def index():
    sleep_duration = None
    sleep_quality = None
    quality_category = None
    if request.method == 'POST':
        # Retrieve and process form data
        gender = request.form.get('gender')
        age = float(request.form.get('age'))
        occupation = request.form.get('occupation')
        physical_activity = float(request.form.get('physical_activity'))
        stress_level = float(request.form.get('stress_level'))
        bmi_category = request.form.get('bmi_category')
        blood_pressure = request.form.get('blood_pressure')
        heart_rate = float(request.form.get('heart_rate'))
        daily_steps = float(request.form.get('daily_steps'))
        sleep_disorder = request.form.get('sleep_disorder')

        # Create user input dictionary
        user_input = {
            'Gender': gender,
            'Age': age,
            'Occupation': occupation,
            'Physical Activity Level': physical_activity,
            'Stress Level': stress_level,
            'BMI Category': bmi_category,
            'Blood Pressure': blood_pressure,
            'Heart Rate': heart_rate,
            'Daily Steps': daily_steps,
            'Sleep Disorder': sleep_disorder
        }

        # Encode categorical features
        user_input['Gender'] = gender_mapping.get(user_input['Gender'], -1)
        user_input['Occupation'] = occupation_mapping.get(user_input['Occupation'], -1)
        user_input['BMI Category'] = bmi_category_mapping.get(user_input['BMI Category'], -1)
        user_input['Sleep Disorder'] = sleep_disorder_mapping.get(user_input['Sleep Disorder'], -1)

        # Split blood pressure into systolic and diastolic
        systolic_bp, diastolic_bp = blood_pressure.split('/')
        user_input['Systolic_BP'] = float(systolic_bp)
        user_input['Diastolic_BP'] = float(diastolic_bp)
        del user_input['Blood Pressure']

        # Create DataFrame and predict
        input_df = pd.DataFrame([user_input])
        predictions = model_final.predict(input_df)

        # Assume predictions[0][0] = sleep duration, predictions[0][1] = sleep quality
        sleep_duration = round(predictions[0][0], 2)  # Rounded to 2 decimals
        sleep_quality = predictions[0][1]

        # Classify sleep quality according to new criteria:
        if sleep_quality > 8.5:
            quality_category = "High"
        elif sleep_quality >= 5:
            quality_category = "Medium"
        else:
            quality_category = "Low"

    return render_template('index.html', sleep_duration=sleep_duration, sleep_quality=sleep_quality,
                           quality_category=quality_category)

if __name__ == '__main__':
    app.run(debug=True)
