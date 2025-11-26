from flask import Flask, render_template, request, jsonify
import torch
import random
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

app = Flask(__name__)

# Load the pre-trained model and tokenizer from Hugging Face
model_name = "AventIQ-AI/distilbert-mental-health-prediction"
tokenizer = DistilBertTokenizer.from_pretrained(model_name)
model = DistilBertForSequenceClassification.from_pretrained(model_name)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Label mapping for each category
label_map = {
    0: "Anxiety",
    1: "Normal",
    2: "Depression",
    3: "Suicidal",
    4: "Stress",
    5: "Bipolar",
    6: "Personality disorder"
}

suggestions = {
    "Anxiety": [
        "Practice deep breathing exercises to help calm your mind.",
        "Try mindfulness meditation for a few minutes daily.",
        "Engage in regular physical activity to manage tension.",
        "Speak with a trusted friend or counselor about your feelings.",
        "Maintain a healthy sleep schedule.",
        "Limit caffeine and other stimulants.",
        "Practice progressive muscle relaxation techniques.",
        "Try yoga to reduce anxiety.",
        "Listen to calming music or nature sounds.",
        "Keep a journal to track your emotions.",
        "Practice gratitude by noting positive experiences.",
        "Spend time in nature to clear your mind.",
        "Avoid stressful triggers when possible.",
        "Use aromatherapy with lavender or chamomile.",
        "Engage in creative hobbies like drawing or writing.",
        "Join a support group to share your experiences.",
        "Consider cognitive behavioral techniques.",
        "Try guided imagery or visualization exercises.",
        "Take regular breaks during work to reduce stress.",
        "Seek professional help if anxiety feels overwhelming."
    ],
    "Normal": [
        "Maintain your balanced lifestyle and healthy habits.",
        "Stay active with regular exercise.",
        "Follow a balanced and nutritious diet.",
        "Keep a consistent sleep schedule.",
        "Stay connected with loved ones.",
        "Keep a gratitude journal.",
        "Practice mindfulness to remain centered.",
        "Pursue hobbies that bring you joy.",
        "Take time for self-care and relaxation.",
        "Engage in social activities you enjoy.",
        "Keep a positive outlook on life.",
        "Set personal goals and celebrate small achievements.",
        "Keep learning and challenging yourself.",
        "Maintain a routine that suits you.",
        "Practice stress-relief techniques as needed.",
        "Focus on personal growth.",
        "Stay informed without becoming overwhelmed.",
        "Balance work and leisure effectively.",
        "Prioritize both mental and physical well-being.",
        "Celebrate your successes and progress."
    ],
    "Depression": [
        "Consider speaking with a mental health professional.",
        "Reach out to a trusted friend or family member.",
        "Establish a daily routine to add structure.",
        "Engage in light physical exercise.",
        "Set small, manageable goals.",
        "Write down your thoughts in a journal.",
        "Join a support group for shared experiences.",
        "Practice mindfulness or meditation.",
        "Avoid isolation by reaching out to others.",
        "Allow yourself to feel and express emotions.",
        "Break tasks into smaller, achievable steps.",
        "Avoid self-criticism and practice self-compassion.",
        "Engage in activities you once enjoyed.",
        "Seek professional therapy for guidance.",
        "Take time to relax and unwind.",
        "Practice deep breathing exercises.",
        "Limit negative self-talk.",
        "Stay connected with supportive people.",
        "Consider cognitive behavioral techniques.",
        "Remember that it's okay to ask for help."
    ],
    "Suicidal": [
        "If you are in immediate danger, please call emergency services now.",
        "Reach out to a trusted friend or family member immediately.",
        "Speak with a mental health professional right away.",
        "Call a crisis hotline if you need immediate support.",
        "Remember that you are not alone and help is available.",
        "Talk to someone who understands your feelings.",
        "If you feel unsafe, please go to a safe place.",
        "Consider reaching out to a support group.",
        "Share your feelings with someone you trust.",
        "It may help to talk about your emotions with a counselor.",
        "Please consider professional help for your mental health.",
        "Your safety is important; seek help immediately if needed.",
        "Take a moment to call a trusted individual or hotline.",
        "Remember, reaching out for help is a sign of strength.",
        "If thoughts become overwhelming, please seek immediate help.",
        "Connect with someone who can provide care and understanding.",
        "Consider speaking to a crisis intervention team.",
        "If you are feeling unsafe, please seek immediate shelter or assistance.",
        "Your life matters; please consider professional support.",
        "If you're struggling, please call a crisis hotline right away."
    ],
    "Stress": [
        "Try relaxation techniques such as meditation.",
        "Take deep breaths to manage immediate stress.",
        "Engage in regular physical activity.",
        "Take short breaks throughout your day.",
        "Practice mindfulness exercises.",
        "Schedule time for hobbies and relaxation.",
        "Listen to calming music.",
        "Try progressive muscle relaxation.",
        "Spend time outdoors to clear your mind.",
        "Keep a journal to express your feelings.",
        "Limit exposure to stressful news.",
        "Practice yoga to alleviate tension.",
        "Take a short walk during busy days.",
        "Reach out to friends for a quick chat.",
        "Practice visualization techniques to relax.",
        "Prioritize tasks to avoid feeling overwhelmed.",
        "Ensure you have time for rest and sleep.",
        "Engage in a creative activity to divert your mind.",
        "Use aromatherapy like lavender to relax.",
        "Remember to take time for self-care daily."
    ],
    "Bipolar": [
        "Consult with a mental health professional for tailored advice.",
        "Maintain a consistent routine to stabilize mood.",
        "Track your mood daily in a journal.",
        "Ensure you have a regular sleep schedule.",
        "Engage in regular physical exercise.",
        "Educate yourself about bipolar disorder.",
        "Stay connected with a supportive network.",
        "Consider joining a bipolar support group.",
        "Avoid substance use, which can trigger mood swings.",
        "Develop a crisis plan with your healthcare provider.",
        "Monitor your triggers and avoid them when possible.",
        "Practice stress management techniques.",
        "Take any prescribed medication as directed.",
        "Discuss your feelings openly with trusted individuals.",
        "Seek therapy to manage mood fluctuations.",
        "Practice mindfulness to stay centered.",
        "Keep a routine for meals and exercise.",
        "Stay informed about your condition.",
        "Allow yourself rest when needed.",
        "Celebrate small achievements during stable periods."
    ],
    "Personality disorder": [
        "Consider seeking therapy to better understand your feelings.",
        "Join a support group for shared experiences.",
        "Practice mindfulness to enhance emotional regulation.",
        "Engage in self-reflection and journaling.",
        "Work with a mental health professional for guidance.",
        "Develop healthy coping mechanisms for stress.",
        "Focus on building healthy relationships.",
        "Attend group therapy sessions for additional support.",
        "Set realistic goals and expectations.",
        "Practice self-compassion and understanding.",
        "Develop a consistent daily routine.",
        "Learn and practice effective communication skills.",
        "Focus on self-care and stress reduction.",
        "Educate yourself about your personality traits.",
        "Consider cognitive behavioral therapy techniques.",
        "Avoid self-destructive behaviors.",
        "Engage in creative outlets to express emotions.",
        "Maintain a support network of trusted individuals.",
        "Take time to relax and reduce stress.",
        "Remember that progress takes time; be patient with yourself."
    ]
}

def predict_mental_health(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    inputs = {key: val.to(device) for key, val in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    predicted_class = torch.argmax(logits, dim=1).item()
    return predicted_class

def get_suggestion(label):
    suggestion_list = suggestions.get(label, ["No suggestion available."])
    return random.choice(suggestion_list)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    user_text = data.get("message", "")
    predicted_class = predict_mental_health(user_text)
    label = label_map.get(predicted_class, "Unknown")
    suggestion = get_suggestion(label)
    response = {"label": label, "suggestion": suggestion}
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
