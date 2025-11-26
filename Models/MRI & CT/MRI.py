import streamlit as st
from google import genai
from PIL import Image
import os
from typing import Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MRIScanAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the MRI Scan Analyzer with API key and configuration."""
        self.client = genai.Client(api_key=api_key)
        self.setup_page_config()
        self.apply_custom_styles()
    
    @staticmethod
    def setup_page_config() -> None:
        """Configure Streamlit page settings."""
        st.set_page_config(
            page_title="MRI Scan Analytics",
            page_icon="🧠",
            layout="wide"
        )
    
    @staticmethod
    def apply_custom_styles() -> None:
        """Apply custom CSS styles with an improved dark theme."""
        st.markdown("""
            <style>
            :root {
                --background-color: #1a1a1a;
                --secondary-bg: #2d2d2d;
                --text-color: #e0e0e0;
                --accent-color: #4CAF50;
                --border-color: #404040;
                --hover-color: #45a049;
            }
            .main { background-color: var(--background-color); }
            .stApp { background-color: var(--background-color); }
            
            .stButton>button {
                width: 100%;
                background-color: var(--accent-color);
                color: white;
                padding: 0.75rem;
                border-radius: 6px;
                border: none;
                font-weight: 600;
                transition: background-color 0.3s ease;
            }
            .stButton>button:hover {
                background-color: var(--hover-color);
            }
            
            .report-container {
                background-color: var(--secondary-bg);
                padding: 2rem;
                border-radius: 12px;
                margin: 1rem 0;
                border: 1px solid var(--border-color);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            </style>
        """, unsafe_allow_html=True)

    def analyze_image(self, img: Image.Image) -> Tuple[Optional[str], Optional[str]]:
        """
        Analyze the MRI scan image using Gemini AI.
        Returns a tuple of (doctor_analysis, patient_analysis).
        """
        try:
            prompts = {
                "doctor": """
Provide a structured analysis of this MRI scan for medical professionals without including any introductory or acknowledgment phrases.
Follow the structure below:

1. Imaging Observations
   - Describe key anatomical structures, signal intensities, and any contrast differences

2. Diagnostic Findings
   - Identify abnormalities and potential areas of concern

3. Clinical Correlation
   - Suggest possible differential diagnoses and recommendations for further evaluation

4. Technical Quality
   - Comment on image quality, positioning, and any artifacts present
                """,
                "patient": """
Explain the findings of this MRI scan in clear, simple terms for a patient without including any introductory or acknowledgment phrases.
Follow the structure below:

1. What We See
   - Describe the part of the body shown and any notable features in everyday language

2. What It Means
   - Provide a simple explanation of the findings and their potential implications

3. Next Steps
   - Outline any recommendations or follow-up actions in a patient-friendly manner
                """
            }
            
            responses = {}
            for audience, prompt in prompts.items():
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[prompt, img]
                )
                responses[audience] = response.text if hasattr(response, 'text') else None
                
            return responses["doctor"], responses["patient"]
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            return None, None

    def segment_image(self, img: Image.Image) -> Optional[Image.Image]:
        """
        Segment the MRI scan using Gemini’s segmentation capabilities.
        Returns an image mask (PIL Image) highlighting segmented regions if successful.
        """
        try:
            segmentation_prompt = """
Segment the key anatomical structures in this MRI scan.
Return an image mask where the segmented regions are highlighted (e.g., in white) on a black background.
Do not include any extra text.
            """
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[segmentation_prompt, img]
            )
            # Assumes that the response contains an image attribute with the segmentation mask.
            seg_mask = response.image if hasattr(response, 'image') else None
            return seg_mask
        except Exception as e:
            logger.error(f"Segmentation failed: {str(e)}")
            return None

    def run(self):
        """Run the Streamlit MRI scan analysis application."""
        st.title("🧠 MRI Scan Analytics")
        st.markdown("""
            Advanced MRI scan analysis powered by AI. Upload your scan for instant
            insights tailored for both medical professionals and patients.
        """)

        col1, col2 = st.columns([1, 1.5])
        with col1:
            uploaded_file = self.handle_file_upload()
        with col2:
            if uploaded_file:
                self.process_analysis(uploaded_file)
                st.markdown("---")
                self.process_segmentation(uploaded_file)
            else:
                self.show_instructions()

        self.show_footer()

    def handle_file_upload(self) -> Optional[object]:
        """Handle file upload and display an image preview."""
        uploaded_file = st.file_uploader(
            "Upload MRI Scan Image",
            type=["png", "jpg", "jpeg"],
            help="Supported formats: PNG, JPG, JPEG"
        )
        
        if uploaded_file:
            img = Image.open(uploaded_file)
            st.image(img, caption="Uploaded MRI Scan", use_container_width=True)
            
            with st.expander("Image Details"):
                st.write(f"**Filename:** {uploaded_file.name}")
                st.write(f"**Size:** {uploaded_file.size/1024:.2f} KB")
                st.write(f"**Format:** {img.format}")
                st.write(f"**Dimensions:** {img.size[0]}x{img.size[1]} pixels")
                
        return uploaded_file

    def process_analysis(self, uploaded_file: object) -> None:
        """Process the uploaded MRI image and display analysis reports."""
        if st.button("🔍 Analyze MRI Scan", key="analyze_button"):
            with st.spinner("Analyzing MRI scan..."):
                img = Image.open(uploaded_file)
                doctor_analysis, patient_analysis = self.analyze_image(img)
                
                if doctor_analysis and patient_analysis:
                    tab1, tab2 = st.tabs(["📋 Medical Report", "👥 Patient Summary"])
                    
                    with tab1:
                        st.markdown("### Medical Professional's Report")
                        st.markdown(f"<div class='report-container'>{doctor_analysis}</div>",
                                    unsafe_allow_html=True)
                    
                    with tab2:
                        st.markdown("### Patient-Friendly Explanation")
                        st.markdown(f"<div class='report-container'>{patient_analysis}</div>",
                                    unsafe_allow_html=True)
                else:
                    st.error("Analysis failed. Please try again.")

    def process_segmentation(self, uploaded_file: object) -> None:
        """Process the uploaded MRI image and display the segmentation mask."""
        if st.button("🔍 Segment MRI Scan", key="segment_button"):
            with st.spinner("Segmenting MRI scan..."):
                img = Image.open(uploaded_file)
                seg_mask = self.segment_image(img)
                if seg_mask:
                    st.image(seg_mask, caption="MRI Segmentation Mask", use_container_width=True)
                else:
                    st.error("Segmentation failed. Please try again.")

    @staticmethod
    def show_instructions() -> None:
        """Display instructions when no image is uploaded."""
        st.info("👈 Upload an MRI scan image to begin analysis")
        
        with st.expander("ℹ️ How it works"):
            st.markdown("""
                1. **Upload** your MRI scan image.
                2. Click **Analyze MRI Scan** to get analysis reports for medical professionals and patients.
                3. Click **Segment MRI Scan** to view the segmentation mask.
            """)

    @staticmethod
    def show_footer() -> None:
        """Display the application footer."""
        st.markdown("---")
        st.markdown(
            """
            <div style='text-align: center'>
                <p style='color: #888888; font-size: 0.8em;'>
                    UNDER DEVELOPMENT
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )

if __name__ == "__main__":
    # Get API key from environment variable or set it directly here.
    api_key = "AIzaSyCp9j5OGZb5hlykMIAJhbDII3IHYJWCrnQ"
    if not api_key:
        st.error("Please set the GEMINI_API_KEY environment variable")
    else:
        analyzer = MRIScanAnalyzer(api_key)
        analyzer.run()
