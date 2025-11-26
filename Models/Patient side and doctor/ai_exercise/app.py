from flask import Flask, render_template, request
import os
import google.generativeai as genai
import markdown  # To convert Markdown to HTML
from bs4 import BeautifulSoup  # For post-processing HTML

app = Flask(__name__)

# Set and configure the Google API key
os.environ["GOOGLE_API_KEY"] = 'AIzaSyCh5ePMjn6WDWhMMZwA7A0JI9HaZj2FmhA'
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))


# Function to calculate BMI
def calculate_bmi(weight, height):
    return weight / (height * height)


# Function to classify BMI into categories
def classify_bmi(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 25:
        return "Normal weight"
    elif 25 <= bmi < 30:
        return "Overweight"
    else:
        return "Obese"


# Function to pre-process the HTML output: add CSS classes to table elements
def preprocess_html_table(html):
    soup = BeautifulSoup(html, "html.parser")
    for table in soup.find_all("table"):
        # You can add any classes you need; here, we add Bootstrap styling classes as an example.
        table['class'] = table.get('class', []) + ["table", "table-striped", "table-bordered"]
    return str(soup)


@app.route("/", methods=["GET", "POST"])
def index():
    recommendation_html = None
    if request.method == "POST":
        try:
            age = int(request.form.get("age"))
            height = float(request.form.get("height"))
            weight = float(request.form.get("weight"))
        except (TypeError, ValueError):
            recommendation_html = "<p>Invalid input. Please try again.</p>"
            return render_template("index.html", recommendation=recommendation_html)

        target = request.form.get("target")
        level = request.form.get("level")

        # Calculate BMI and classify the category
        bmi = calculate_bmi(weight, height)
        bmi_category = classify_bmi(bmi)

        # Create a prompt for the Gemini model
        prompt = (
            f"User details: Age: {age}, Height: {height}m, Weight: {weight}kg, "
            f"BMI: {bmi:.2f}, Category: {bmi_category}, Target: {target}, Level: {level}. "
            "Based on these details, generate a Markdown-formatted output that includes two sections: \n\n"
            "1. **Exercise Suggester Table:** Create a table with columns such as Exercise, Reps, Sets, and Duration (or any other relevant details). \n\n"
            "2. **1-Week Gym Workout Planner:** Provide a comprehensive day-by-day workout planner for one week, formatted clearly in Markdown. \n\n"
            "Ensure the Markdown output is properly formatted and easy to read."
        )

        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)

        # Convert the Markdown output to HTML with table support
        recommendation_html = markdown.markdown(
            response.text, extensions=["tables", "fenced_code"]
        )

        # Pre-process the HTML to adjust the table formatting (e.g., add CSS classes)
        recommendation_html = preprocess_html_table(recommendation_html)

    return render_template("index.html", recommendation=recommendation_html)


if __name__ == "__main__":
    app.run(debug=True, port=4529)
