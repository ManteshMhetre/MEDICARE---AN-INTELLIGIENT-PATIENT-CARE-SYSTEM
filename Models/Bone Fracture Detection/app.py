import os
import numpy as np
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# Load your trained model (update with your actual .h5 filename)
model = load_model('finalbonefracture.h5')

# Ensure the uploads folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def predict_image_class(img_path):
    """Load the image, preprocess, and predict fracture or no-fracture."""
    img = image.load_img(img_path, target_size=(150, 150))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    prediction = model.predict(img_array)
    # For binary classification: > 0.5 => Fractured, otherwise Not Fractured
    return "Fractured" if prediction[0][0] > 0.5 else "Not Fractured"

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Check if an image file was uploaded
        if 'image_file' not in request.files:
            return redirect(request.url)

        file = request.files['image_file']
        if file.filename == '':
            return redirect(request.url)

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Predict the class
            result = predict_image_class(file_path)
            return render_template('index.html',
                                   uploaded_image=filename,
                                   prediction=result)

    return render_template('index.html', uploaded_image=None, prediction=None)

if __name__ == '__main__':
    app.run(debug=True)
