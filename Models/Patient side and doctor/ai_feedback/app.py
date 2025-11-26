from flask import Flask, render_template, request, jsonify, session, redirect
import google.generativeai as genai
import PyPDF2
import os
import re
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.secret_key = '688ed745a74bdd7ac238f5b50f4104fb87d6774b8b0a4e06e7e18ac5ed0fa31c'  # Add this for session management
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Gemini API Configuration
genai.configure(api_key="AIzaSyA3joMQMnael_heUCwpNvoRznCUiU3avf4")

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
)


def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def extract_care_plan_format(pdf_text):
    """Extract the care plan format from PDF text"""
    try:
        # Find sections and their content in the PDF using regex
        sections = re.findall(
            r'([A-Z][A-Z\s]+)[:|\n]((?:(?!\n[A-Z][A-Z\s]+[:|\n]).)*)',
            pdf_text,
            re.DOTALL
        )

        if sections:
            format_template = ""
            for section, content in sections:
                format_template += f"{section.strip()}:\n"
                # Extract bullet points if they exist and remove any asterisks
                bullets = re.findall(r'[-•*]\s*(.*?)(?=[-•*]|\n|$)', content)
                if bullets:
                    for bullet in bullets:
                        format_template += f"- {bullet.strip()}\n"
                format_template += "\n"
            return format_template
        return None
    except Exception as e:
        print(f"Error extracting format: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/switch_role', methods=['POST'])
def switch_role():
    role = request.form.get('role')
    session['role'] = role
    return jsonify({'success': True, 'role': role})

@app.route('/doctor_dashboard')
def doctor_dashboard():
    if session.get('role') != 'doctor':
        return redirect('/')
    return render_template('doctor_dashboard.html')

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    try:
        feedback = request.form.get('feedback', '')
        care_plan_text = ""
        care_plan_format = None

        if 'care_plan_pdf' in request.files:
            pdf_file = request.files['care_plan_pdf']
            if pdf_file.filename != '':
                care_plan_text = extract_text_from_pdf(pdf_file)
                care_plan_format = extract_care_plan_format(care_plan_text)

        # If no format is found in the PDF, use a default format
        if not care_plan_format:
            care_plan_format = """
ASSESSMENT:
[Assessment details]

DAILY CARE PLAN:
Morning:
- [Morning activities]

Afternoon:
- [Afternoon activities]

Evening:
- [Evening activities]

MEDICATIONS:
- [Medication details]

ADDITIONAL RECOMMENDATIONS:
- [Recommendations]

FOLLOW-UP:
[Follow-up details]
            """

        # Define emergency keywords to check for severe symptoms
        emergency_keywords = [
            # Cardiovascular
            "severe chest pain", "heart attack", "shortness of breath",
            "dizziness", "loss of consciousness", "extreme pain",

            # Neurological
            "sudden weakness", "confusion", "slurred speech", "severe headache",

            # Respiratory
            "difficulty breathing", "severe shortness of breath", "wheezing", "respiratory distress",

            # Gastrointestinal
            "severe abdominal pain", "persistent vomiting", "uncontrolled bleeding",

            # Others
            "severe allergic reaction", "anaphylaxis"
        ]

        feedback_lower = feedback.lower()
        is_emergency = any(keyword in feedback_lower for keyword in emergency_keywords)

        if is_emergency:
            # Store emergency notification
            emergency_data = {
                'patient_feedback': feedback,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'status': 'urgent'
            }
            # In a real application, you would store this in a database
            # For now, we'll use a global variable (not recommended for production)
            if not hasattr(app, 'emergency_notifications'):
                app.emergency_notifications = []
            app.emergency_notifications.append(emergency_data)

            # If emergency symptoms are detected, instruct immediate emergency response
            emergency_message = (
                "Emergency symptoms detected. Please call emergency services immediately at 104/108/109/112."
            )
            return jsonify({
                'success': True,
                'updated_plan': emergency_message
            })

        # Prepare a prompt for Gemini AI for a perfect, attractively formatted day care plan.
        prompt = f"""
Patient Care Plan Update Request:
Current Symptoms and Feedback: {feedback}
Current Care Plan (extracted from PDF): {care_plan_text}

Based on the patient's feedback and current care plan, please provide an updated, perfect daily care plan in the exact following format:

{care_plan_format}

Please ensure the following:
- The response is well-structured with clear section headings.
- Use bullet points for list items without including any asterisk (*) symbols.
- Format the text attractively and professionally.
- Remove any extraneous symbols.
"""
        # Get response from Gemini AI
        response = model.generate_content(prompt)
        # Remove any asterisk symbols from the response text
        updated_plan = response.text.replace("*", "")

        return jsonify({
            'success': True,
            'updated_plan': updated_plan
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/get_emergency_notifications')
def get_emergency_notifications():
    if session.get('role') != 'doctor':
        return jsonify({'success': False, 'error': 'Unauthorized'})
    
    notifications = getattr(app, 'emergency_notifications', [])
    return jsonify({'success': True, 'notifications': notifications})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
