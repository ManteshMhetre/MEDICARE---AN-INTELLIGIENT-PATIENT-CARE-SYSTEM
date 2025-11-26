import os
import tempfile
from flask import Flask, render_template, request, redirect, url_for
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB limit
app.config['UPLOAD_EXTENSIONS'] = ['.jpg', '.jpeg', '.png']

# genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
genai.configure(api_key='AIzaSyCOMBqPYEPI2dIBVOGp_Scuy5z02nfs1lA')
model = genai.GenerativeModel('gemini-1.5-flash')


def analyze_image(image_data, mime_type):
    prompt = """
    You are a medical assistant. Analyze this medical image provided.
    Provide:
    1. Brief analysis of what you observe
    2. 3-5 practical home remedies (if appropriate)
    3. When to seek professional medical help

    If the image is unclear or non-medical, state that clearly.
    Structure response with: Analysis, Home Remedies, When to Seek Help.
    give the answer in proper structure only as i mention and bold the heading and don't include
    the ** part in the response.
    The response should be strictly in 3 phases/sequence:
    Analysis,Home Remedies and When to Seek Help.
    Structure the response in proper format and each remedies should be in new line with 
    proper gap and spacings.
    So the response should be like:
    Analysis of image:
        (5-6 lines of analysis) 
    Home remedies:
        (5-6 home remedies) 
    When to seek help:
        (appropriate content)
    Please strictly don't include the astriks (*) signs in the response
    instead use (bullet points) strictly
    """

    # Create proper image part for Gemini API
    image_part = {
        "mime_type": mime_type,
        "data": image_data
    }

    response = model.generate_content([prompt, image_part])
    return response.text


@app.route('/chatbot')
def index():
    return render_template('index.html')


@app.route('/chatbot/upload', methods=['POST'])
def chatbot_upload():
    uploaded_file = request.files['file']
    if uploaded_file.filename != '':
        file_ext = os.path.splitext(uploaded_file.filename)[1].lower()

        # Validate file type
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            return "Invalid file type", 400

        # Determine MIME type
        mime_type = "image/jpeg"  # default
        if file_ext == '.png':
            mime_type = 'image/png'
        elif file_ext in ['.jpeg', '.jpg']:
            mime_type = 'image/jpeg'

        try:
            # Read image data directly from memory
            image_data = uploaded_file.read()
            analysis_result = analyze_image(image_data, mime_type)
        except Exception as e:
            return f"Error processing image: {str(e)}", 500

        return render_template('result.html', result=analysis_result)
    return redirect(url_for('chatbot_index'))


if __name__ == '__main__':
    app.run(debug=True,port=3400)