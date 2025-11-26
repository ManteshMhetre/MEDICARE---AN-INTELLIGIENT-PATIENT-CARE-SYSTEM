import os
import logging
from flask import Flask, request, render_template, redirect, flash, url_for
from werkzeug.utils import secure_filename
import PyPDF2
from PIL import Image
import io
import base64
from google import genai
import pytesseract  # OCR library for extracting text from images
import markdown  # add this import at the top

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
logging.basicConfig(level=logging.DEBUG)

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB max file size
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_images_from_pdf(pdf_path):
    """Extract images from PDF file and convert to base64"""
    images_data = []
    try:
        with open(pdf_path, "rb") as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                for image_file_object in page.images:
                    try:
                        image = Image.open(io.BytesIO(image_file_object.data))
                        # Convert image to base64
                        buffered = io.BytesIO()
                        image.save(buffered, format="PNG")
                        img_str = base64.b64encode(buffered.getvalue()).decode()
                        images_data.append(img_str)
                    except Exception as e:
                        logging.warning(f"Failed to process image: {str(e)}")
    except Exception as e:
        logging.error(f"Error extracting images: {str(e)}")
    return images_data

def extract_text_from_image(image_path):
    """Extract text from image using OCR"""
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        logging.error(f"Error extracting text from image: {str(e)}")
        return ""

def get_scan_type(text):
    """Determine the type of scan from the text content"""
    text_lower = text.lower()
    if 'ct' in text_lower or 'computed tomography' in text_lower:
        return 'CT'
    elif 'ecg' in text_lower or 'electrocardiogram' in text_lower:
        return 'ECG'
    return 'Unknown'

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    if request.method == 'POST':
        logging.debug("Received a POST request.")
        
        if 'file' not in request.files:
            logging.debug("No file part found in the request.")
            flash('No file selected', 'error')
            return redirect(request.url)
            
        file = request.files['file']
        
        if file.filename == '':
            logging.debug("No file selected for uploading.")
            flash('No file selected', 'error')
            return redirect(request.url)
            
        if request.content_length > MAX_FILE_SIZE:
            flash(f'File size exceeds {MAX_FILE_SIZE // (1024 * 1024)}MB limit', 'error')
            return redirect(request.url)
            
        if file and allowed_file(file.filename):
            try:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                logging.debug(f"Saving file to {file_path}")
                file.save(file_path)
                
                # Extract text
                text = ""
                with open(file_path, "rb") as pdf_file:
                    pdf_reader = PyPDF2.PdfReader(pdf_file)
                    for page_num, page in enumerate(pdf_reader.pages):
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text
                        logging.debug(f"Extracted text from page {page_num}")
                
                # Handle image upload
                image_text = ""
                if 'image' in request.files:
                    image_file = request.files['image']
                    if image_file.filename != '' and allowed_file(image_file.filename):
                        image_filename = secure_filename(image_file.filename)
                        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
                        image_file.save(image_path)
                        image_text = extract_text_from_image(image_path)
                        logging.debug(f"Extracted text from image: {image_text}")
                
                # Combine text from PDF and image
                combined_text = text + " " + image_text
                
                # Determine scan type
                scan_type = get_scan_type(combined_text)
                
                # Extract images
                images_data = extract_images_from_pdf(file_path)
                image_count = len(images_data)
                logging.debug(f"Extracted {image_count} images from PDF")
                
                # Construct the content for Gemini API
                prompt = f"""
                You are a professional medical imaging specialist analyzing a {scan_type} scan report.
                Please provide a comprehensive analysis of this report just tell directly about following points no intro , including:
                1. Key findings and observations
                2. Any significant abnormalities or concerns
                3. Technical quality of the scan
                4. Recommendations for follow-up (if any)
                
                The report contains {image_count} images and the following text content:
                
                {combined_text}
                
                Please note any limitations in your analysis if the image quality or content is unclear.
                """
                
                # Initialize Gemini client
                client = genai.Client(api_key="AIzaSyArihOGcyK5KcQR4ntIqNga6bSoq7kM7Yo")
                
                logging.debug("Calling Gemini API for content generation.")
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt
                )
                
                analysis_text = response.text
                analysis_html = markdown.markdown(analysis_text)  # convert markdown to HTML

                result = {
                    'analysis': analysis_text,        # original text (if needed)
                    'analysis_html': analysis_html,     # HTML version for rendering
                    'scan_type': scan_type,
                    'image_count': image_count,
                    'images': images_data
                }
                logging.debug("Received response from Gemini API.")
                
            except Exception as e:
                logging.exception("Error processing file:")
                flash(f"Error processing file: {str(e)}", 'error')
                return redirect(request.url)
            finally:
                # Clean up
                if os.path.exists(file_path):
                    os.remove(file_path)
                logging.debug("Temporary file removed after processing.")
        else:
            flash('Only PDF and image files are allowed', 'error')
            return redirect(request.url)
            
    return render_template("index.html", result=result)

if __name__ == '__main__':
    app.run(debug=True)
