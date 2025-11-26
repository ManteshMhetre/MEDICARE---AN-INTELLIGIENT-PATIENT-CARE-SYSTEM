import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def upload_file(file_path, folder="medicare"):
    """
    Uploads a file to Cloudinary and returns the secure URL.

    :param file_path: Path to the file (string)
    :param folder: Folder name in Cloudinary (optional, default: "uploads")
    :return: Secure URL of the uploaded file
    """
    try:
        response = cloudinary.uploader.upload(file_path, folder=folder)
        return response["secure_url"]
    except Exception as e:
        return str(e)