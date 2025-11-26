from flask import Flask, render_template, request
import pandas as pd
import numpy as np
import plotly.graph_objects as go

app = Flask(__name__)

# Load the diet data
diet_df = pd.read_csv("edi-4data.csv")

# Diet category mapping
diet_category_map = {1: "underweight", 2: "normal", 3: "overweight", 4: "obese", 5: "extremely obese"}

# Replace missing values if any
diet_df.fillna(0, inplace=True)


def split_calorie_intake(total_calories):
    breakfast_calories = total_calories * 0.3
    lunch_calories = total_calories * 0.4
    dinner_calories = total_calories * 0.3
    return breakfast_calories, lunch_calories, dinner_calories


def generate_meal_options(df, calories):
    meal_options = df.sample(frac=1).reset_index(drop=True)
    total_calories = meal_options['Calories (kcal)'].sum()

    while total_calories > calories + 200 or total_calories < calories - 200:
        if total_calories > calories + 200:
            meal_options = meal_options.iloc[:-1]
        elif total_calories < calories - 200:
            meal_options = pd.concat([meal_options, df.sample()])
        total_calories = meal_options['Calories (kcal)'].sum()

    return meal_options


def optimize_meal(meal_df, target_calories):
    meal_df = meal_df.sort_values(by='Calories (kcal)', ascending=False)
    selected_items = []
    remaining_calories = target_calories

    for index, row in meal_df.iterrows():
        if remaining_calories >= row['Calories (kcal)']:
            selected_items.append(index)
            remaining_calories -= row['Calories (kcal)']

    if remaining_calories > 0:
        nearest_solution = None
        nearest_difference = float('inf')
        for index, row in meal_df.iterrows():
            if index not in selected_items:
                difference = abs(row['Calories (kcal)'] - remaining_calories)
                if difference < nearest_difference:
                    nearest_solution = index
                    nearest_difference = difference

        if nearest_solution is not None:
            selected_items.append(nearest_solution)

    return meal_df.loc[selected_items]


def generate_diet_chart(user_data, df):
    temp_df = df.copy()

    # Filter for vegetarian if needed
    if user_data['dietary_preference'] == 'veg':
        temp_df = temp_df[temp_df['veg/nonveg'] == 1]

    # Remove foods with allergens/diseases mentioned
    if user_data['allergies_diseases']:
        allergies = user_data['allergies_diseases'].split(',')
        for allergy in allergies:
            temp_df = temp_df[~temp_df['Food Item'].str.contains(allergy.strip(), case=False, na=False)]

    # Split the new calorie intake into meals
    breakfast_calories, lunch_calories, dinner_calories = split_calorie_intake(user_data['new_calorie_intake'])

    breakfast_options = generate_meal_options(temp_df, breakfast_calories)
    lunch_options = generate_meal_options(temp_df, lunch_calories)
    dinner_options = generate_meal_options(temp_df, dinner_calories)

    breakfast_df = optimize_meal(breakfast_options, breakfast_calories)
    lunch_df = optimize_meal(lunch_options, lunch_calories)
    dinner_df = optimize_meal(dinner_options, dinner_calories)

    return breakfast_df, lunch_df, dinner_df


@app.route("/", methods=["GET", "POST"])
def index():
    results = None
    if request.method == "POST":
        # Get user input from the form
        user_gender = request.form.get("user_gender")
        user_gender_value = 0 if user_gender == "Male" else 1
        user_height = float(request.form.get("user_height"))
        user_weight = float(request.form.get("user_weight"))
        user_age = int(request.form.get("user_age"))
        allergies_diseases = request.form.get("allergies_diseases", "").strip().lower()
        dietary_preference = request.form.get("dietary_preference", "").strip().lower()
        activity_level = int(request.form.get("activity_level"))

        # Calculate BMI
        bmi = user_weight / ((user_height / 100) ** 2)

        # Dummy prediction for BMI category
        if bmi < 18.5:
            predicted_category = 1  # Underweight
        elif bmi < 25:
            predicted_category = 2  # Normal weight
        elif bmi < 30:
            predicted_category = 3  # Overweight
        elif bmi < 35:
            predicted_category = 4  # Obese
        else:
            predicted_category = 5  # Extremely Obese

        # Calculate initial calorie intake using the Mifflin-St Jeor equation
        initial_calorie_intake = 10 * user_weight + 6.25 * user_height - 5 * user_age + (5 if user_gender_value == 0 else -161)

        # Adjust calorie intake based on BMI category
        if predicted_category == 1:  # Underweight
            normal_bmi_calories = 18 * ((user_height / 100) ** 2)
            new_calorie_intake = initial_calorie_intake + normal_bmi_calories + 650
            calorie_adjustment = normal_bmi_calories
        elif predicted_category in [3, 4]:  # Overweight or Obese
            normal_bmi_calories = 25 * ((user_height / 100) ** 2)
            new_calorie_intake = initial_calorie_intake - normal_bmi_calories + 200
            calorie_adjustment = normal_bmi_calories
        else:
            calorie_adjustment = 0
            new_calorie_intake = initial_calorie_intake + calorie_adjustment + 350

        user_data = {
            'bmi': round(bmi, 2),
            'body_category': diet_category_map[predicted_category],
            'initial_calorie_intake': round(initial_calorie_intake, 2),
            'calorie_adjustment': calorie_adjustment,
            'new_calorie_intake': round(new_calorie_intake, 2),
            'allergies_diseases': allergies_diseases,
            'dietary_preference': dietary_preference,
            'activity_level': activity_level,
            'age': user_age
        }

        # Generate diet chart for breakfast, lunch, and dinner
        breakfast_df, lunch_df, dinner_df = generate_diet_chart(user_data, diet_df)

        # Generate Plotly chart for calorie distribution among meals
        meal_labels = ['Breakfast', 'Lunch', 'Dinner']
        calorie_values = [
            breakfast_df['Calories (kcal)'].sum(),
            lunch_df['Calories (kcal)'].sum(),
            dinner_df['Calories (kcal)'].sum()
        ]
        fig_cal = go.Figure(data=[go.Bar(x=meal_labels, y=calorie_values, marker_color=['blue', 'green', 'orange'])])
        fig_cal.update_layout(title_text='Calorie Distribution Among Meals',
                              xaxis_title='Meal', yaxis_title='Calories (kcal)')
        calorie_chart = fig_cal.to_html(full_html=False)

        # Generate Plotly chart for nutrient distribution across meals
        nutrient_labels = ['Protein', 'Carbohydrates', 'Fats']
        breakfast_nutrients = [
            breakfast_df['Protein (g)'].sum(),
            breakfast_df['Carbohydrates(g)'].sum(),
            breakfast_df['Fats (g)'].sum()
        ]
        lunch_nutrients = [
            lunch_df['Protein (g)'].sum(),
            lunch_df['Carbohydrates(g)'].sum(),
            lunch_df['Fats (g)'].sum()
        ]
        dinner_nutrients = [
            dinner_df['Protein (g)'].sum(),
            dinner_df['Carbohydrates(g)'].sum(),
            dinner_df['Fats (g)'].sum()
        ]
        fig_nutrient = go.Figure(data=[
            go.Bar(name='Breakfast', x=nutrient_labels, y=breakfast_nutrients),
            go.Bar(name='Lunch', x=nutrient_labels, y=lunch_nutrients),
            go.Bar(name='Dinner', x=nutrient_labels, y=dinner_nutrients)
        ])
        fig_nutrient.update_layout(barmode='group', title='Nutrient Distribution Across Meals',
                                   xaxis_title='Nutrients', yaxis_title='Quantity (g)')
        nutrient_chart = fig_nutrient.to_html(full_html=False)

        # Convert dataframes to dictionary records for easy templating
        breakfast_records = breakfast_df.to_dict(orient='records')
        lunch_records = lunch_df.to_dict(orient='records')
        dinner_records = dinner_df.to_dict(orient='records')

        results = {
            'bmi': round(bmi, 2),
            'body_category': diet_category_map[predicted_category],
            'initial_calorie_intake': round(initial_calorie_intake, 2),
            'new_calorie_intake': round(new_calorie_intake, 2),
            'age': user_age,
            'breakfast': breakfast_records,
            'breakfast_total_calories': breakfast_df['Calories (kcal)'].sum(),
            'breakfast_total_protein': breakfast_df['Protein (g)'].sum(),
            'breakfast_total_carbs': breakfast_df['Carbohydrates(g)'].sum(),
            'breakfast_total_fats': breakfast_df['Fats (g)'].sum(),
            'lunch': lunch_records,
            'lunch_total_calories': lunch_df['Calories (kcal)'].sum(),
            'lunch_total_protein': lunch_df['Protein (g)'].sum(),
            'lunch_total_carbs': lunch_df['Carbohydrates(g)'].sum(),
            'lunch_total_fats': lunch_df['Fats (g)'].sum(),
            'dinner': dinner_records,
            'dinner_total_calories': dinner_df['Calories (kcal)'].sum(),
            'dinner_total_protein': dinner_df['Protein (g)'].sum(),
            'dinner_total_carbs': dinner_df['Carbohydrates(g)'].sum(),
            'dinner_total_fats': dinner_df['Fats (g)'].sum(),
            'calorie_chart': calorie_chart,
            'nutrient_chart': nutrient_chart
        }

    return render_template("index.html", results=results)


if __name__ == '__main__':
    app.run(debug=True,port=5265)
