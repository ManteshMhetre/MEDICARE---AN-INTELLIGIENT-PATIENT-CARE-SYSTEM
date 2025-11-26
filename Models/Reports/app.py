from flask import Flask, render_template, request, redirect, flash, jsonify
import google.generativeai as genai
from PIL import Image
import io
import fitz  
import tempfile
import os
import markdown2  
import re  

genai.configure(api_key="AIzaSyA3joMQMnael_heUCwpNvoRznCUiU3avf4")

app = Flask(__name__)
app.secret_key = "supersecretkey"  

def process_file(file):
    """Process file into appropriate format for Gemini"""
    if file.content_type == 'application/pdf':
        try:
            pdf_bytes = file.read()
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            first_page = pdf_document[0]
            pix = first_page.get_pixmap()
            
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            return img, file.filename
            
        except Exception as e:
            raise Exception(f"Error processing PDF {file.filename}: {str(e)}")
    else:
        try:
            image_bytes = file.read()
            image = Image.open(io.BytesIO(image_bytes))
            return image, file.filename
        except Exception as e:
            raise Exception(f"Error processing image {file.filename}: {str(e)}")

def fix_table_formatting(text):
    """Fix markdown table formatting"""
    lines = text.split('\n')
    fixed_lines = []
    in_table = False
    
    for line in lines:
        if line.strip().startswith('|') and line.strip().endswith('|'):
            in_table = True
            cells = [cell.strip() for cell in line.split('|')]
            cells = [cell for cell in cells if cell]
            fixed_line = '| ' + ' | '.join(cells) + ' |'
            fixed_lines.append(fixed_line)
        else:
            if in_table:
                in_table = False
            fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        if "files" not in request.files:
            return jsonify({"error": "No files uploaded"})

        files = request.files.getlist("files")
        if not files or files[0].filename == "":
            return jsonify({"error": "No files selected"})

        try:
            processed_files = []
            for file in files:
                processed_content, filename = process_file(file)
                processed_files.append((processed_content, filename))

            filenames = [f[1] for f in processed_files]
            files_list = "\n".join([f"- {fname}" for fname in filenames])

            model = genai.GenerativeModel("gemini-1.5-flash")

            content_parts = []
            for img, _ in processed_files:
                content_parts.append(img)

            content_parts.append(
                f"""Analyze all {len(files)} medical documents provided and create a comprehensive summary.

                Documents being analyzed:
                {files_list}

                Provide a unified analysis in the following format:

                # Combined Medical Report Analysis

                ## Documents Overview
                - Number of documents analyzed: {len(files)}
                - List of documents analyzed:
                {files_list}
                
                ## Aggregate Patient Information
                - Summarize patient details if consistent across reports
                - Note any differences in patient information
                
                # Summary 
                only and only 10 points of all the reports combined must be in the summary
                i want the points sorted according to the year of the report in descending order
                There should be year in the summary and don't mention the report name in the summary and the summary should have points in descending chronological order means the latest first and then the older ones(all sorted)
                the feature points should be in DECENDING ORDER of the Year of report means newest first and only mention the year of the report not the full date at end of the point in brackets
                The most important points is aside from patient information all the rest of the report result of all the reports must be in 10 points only 

                Important:
                - Consider ALL documents in the analysis
                - Compare values across documents
                - Note any trends or changes
                - Mark abnormal values with **bold**
                """
            )

            response = model.generate_content(content_parts)
            
            if response and response.text:
                summary = response.text.strip()
                if summary.lower().startswith("please provide"):
                    return jsonify({"error": "Could not analyze the documents"})
                
                fixed_summary = fix_table_formatting(summary)
                html_summary = markdown2.markdown(fixed_summary, extras=['tables', 'fenced-code-blocks'])
                return jsonify({"summary": fixed_summary, "html_summary": html_summary})
            else:
                return jsonify({"error": "No summary could be generated"})
                
        except Exception as e:
            return jsonify({"error": f"Error processing files: {str(e)}"})

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True,port=4567)
