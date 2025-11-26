# MEDICARE — An Intelligent Patient Care System

A robust healthcare platform facilitating real-time video consultations between doctors and patients, powered by AI-driven patient features and industry-leading technology integrations.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [AI Models & Integrations](#ai-models--integrations)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contact](#contact)

---

## Overview

**MEDICARE** is designed to revolutionize telemedicine by enabling seamless video consultations and intelligent support for patients and doctors. The system integrates secure video calls using Jitsi and automated patient communication via Twilio. Extensive AI features allow patients to access intelligent testing and diagnostic tools.

> **Note:** My Major contributions to this project focused on developing and integrating AI models powering patient-centric features and diagnostics (see [AI Models & Integrations](#ai-models--integrations)).

## Key Features

- **Doctor–Patient Video Consultation**  
  Secure, high-quality video calls powered by [Jitsi](https://jitsi.org/).

- **Automated Consultation Delivery**  
  Post-consultation reports and recommendations sent automatically to patients using [Twilio](https://www.twilio.com/).

- **AI-Driven Patient Features**  
  - Predictive analytics and suggestions for treatment
  - Diagnostic test assistance
  - Smart symptom-checkers
  - Health risk assessments  
  *Explore the deployed models and features here:* [HuggingFace Features Page](https://huggingface.co/spaces/ManteshMhetre/Features-Page)

- **User-friendly Dashboards & UI**  
  Clean, responsive design for both doctors and patients.

---

## AI Models & Integrations

The platform integrates a suite of AI models (hosted on HuggingFace Spaces) for advanced patient testing and diagnosis.  
Explore live demos and sources:  
➡️ [HuggingFace Features Page](https://huggingface.co/spaces/ManteshMhetre/Features-Page)

**Major Contribution:**  
All AI model development, configuration, and deployment are the core technical contribution of this project. Models were created, trained, and integrated with the patient care and diagnostic workflow.

---

## Tech Stack

| Technology          | Usage                                      |
|---------------------|--------------------------------------------|
| Jupyter Notebook    | Core data science, model training, and analysis |
| JavaScript          | Frontend interactive features              |
| Python              | Backend logic, AI model integration        |
| HTML & CSS          | Responsive UI/UX                          |
| Jitsi Meet          | Real-time video conferencing               |
| Twilio API          | Secure communication & notifications       |
| HuggingFace Spaces  | AI models deployment and demos             |

---

## Getting Started

### Prerequisites

- Python ≥ 3.7
- Node.js ≥ 14
- Jupyter Notebook
- (Recommended) Virtual environment: `venv` or `conda`

### Installation

1. **Clone the Repository:**  
   ```bash
   git clone https://github.com/ManteshMhetre/MEDICARE---AN-INTELLIGIENT-PATIENT-CARE-SYSTEM.git
   cd MEDICARE---AN-INTELLIGIENT-PATIENT-CARE-SYSTEM
   ```

2. **Python Dependencies:**  
   Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. **Node.js Dependencies (if applicable):**  
   ```bash
   npm install
   ```

4. **Configuration:**  
   - Create `.env` file for sensitive keys (`TWILIO_API_KEY`, Jitsi config, etc.)

### Running the Project

- **Jupyter Notebooks:**  
  Launch for AI analyses and model usage:
  ```bash
  jupyter notebook
  ```

- **Frontend/Backend:**  
  Depending on implementation, start your server:  
  ```bash
  # For Python Flask 
  cd backend
  python app.py

  # For React frontend
  cd frontend
  npm run dev
  ```

---

## Usage

1. **Doctor Sign-In / Patient Registration**
2. **Initiate or Join Video Consultation**
3. **Real-time diagnosis and chat**
4. **AI-assisted testing and reporting**
5. **Automated prescription & report delivery through Twilio**

---

## Contact

**Mantesh Mhetre**  
GitHub: [@ManteshMhetre](https://github.com/ManteshMhetre)  
Email: [mhetremantesh26@gmail.com](mailto:mhetremantesh26@gmail.com)  
HuggingFace Spaces: [Features Page](https://huggingface.co/spaces/ManteshMhetre/Features-Page)  
Questions or feedback welcome via GitHub Issues!

---
