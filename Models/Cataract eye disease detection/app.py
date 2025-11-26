from flask import Flask, render_template
import pandas as pd
from datetime import datetime, time  # Import time here as well
from apscheduler.schedulers.background import BackgroundScheduler
from twilio.rest import Client
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables
load_dotenv()

# -------------------------------
# Load the three Excel files
# -------------------------------
# Ensure that comodity.xlsx, commoditycurrent.xlsx, and commodity2.xlsx are in the same directory as this file.
df_med = pd.read_excel('comodity.xlsx')       # Columns: Time, Medication Name, Dosage, Notes
df_meal = pd.read_excel('commoditycurrent.xlsx')      # Columns: Time, Meal, Details
df_activity = pd.read_excel('commodity2.xlsx')  # Columns: Time, Activity, Duration, Notes

# -------------------------------
# Twilio Credentials & Settings
# -------------------------------
PATIENT_PHONE = os.getenv('TWILIO_PATIENT_PHONE', 'whatsapp:+917559355282')
DEFAULT_LOCATION = (18.5204, 73.8567)  # Example coordinates (unused now)
ACCOUNT_SID = os.getenv('TWILIO_WHATSAPP_ACCOUNT_SID')
AUTH_TOKEN = os.getenv('TWILIO_WHATSAPP_AUTH_TOKEN')
TWILIO_FROM = os.getenv('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')

def send_whatsapp_message(message, location=DEFAULT_LOCATION):
    """
    Sends a WhatsApp message using Twilio.
    (Note: Location details are no longer included in the message.)
    """
    message_content = message  # Do not append location info
    client = Client(ACCOUNT_SID, AUTH_TOKEN)
    msg = client.messages.create(
        from_=TWILIO_FROM,
        body=message_content,
        to=PATIENT_PHONE
    )
    print("Message sent, SID:", msg.sid)

def parse_time(time_val):
    """
    Parse a time value to a tuple of (hour, minute) in 24-hour format.
    If the value is a string (e.g., "8:00 AM"), it is parsed accordingly.
    If it's a datetime.time object, extract the hour and minute directly.
    """
    if isinstance(time_val, str):
        dt = datetime.strptime(time_val.strip(), "%I:%M %p")
        return dt.hour, dt.minute
    elif isinstance(time_val, time):
        return time_val.hour, time_val.minute
    elif isinstance(time_val, datetime):
        return time_val.hour, time_val.minute
    else:
        raise ValueError("Unsupported type for time value.")

def schedule_task(time_val, message, job_id):
    """
    Schedule a daily job with APScheduler that will send a WhatsApp reminder.
    """
    hour, minute = parse_time(time_val)
    scheduler.add_job(
        send_whatsapp_message,
        'cron',
        args=[message, DEFAULT_LOCATION],
        hour=hour,
        minute=minute,
        id=job_id
    )
    print(f"Scheduled job {job_id} for {time_val} with message: {message}")

# -------------------------------
# Set up APScheduler to schedule reminders
# -------------------------------
scheduler = BackgroundScheduler()

# Schedule medication reminders (from df_med)
for idx, row in df_med.iterrows():
    time_val = row["Time"]
    message = (f"Medication Reminder ({time_val}): "
               f"Take {row['Medication Name']} ({row['Dosage']}). "
               f"Note: {row['Notes']}.")
    job_id = f"med-{idx}"
    schedule_task(time_val, message, job_id)

# Schedule meal reminders (from df_meal)
for idx, row in df_meal.iterrows():
    time_val = row["Time"]
    message = (f"Meal Reminder ({time_val}): It's time for {row['Meal']}. "
               f"Details: {row['Details']}.")
    job_id = f"meal-{idx}"
    schedule_task(time_val, message, job_id)

# Schedule activity reminders (from df_activity)
for idx, row in df_activity.iterrows():
    time_val = row["Time"]
    message = (f"Activity Reminder ({time_val}): {row['Activity']} for {row['Duration']}. "
               f"Note: {row['Notes']}.")
    job_id = f"activity-{idx}"
    schedule_task(time_val, message, job_id)

scheduler.start()

# -------------------------------
# Flask route to render the dashboard
# -------------------------------
@app.route('/')
def index():
    # Convert each DataFrame to an HTML table with Bootstrap classes
    med_table = df_med.to_html(classes="table table-bordered table-hover", index=False)
    meal_table = df_meal.to_html(classes="table table-bordered table-hover", index=False)
    activity_table = df_activity.to_html(classes="table table-bordered table-hover", index=False)
    return render_template('index.html',
                           med_table=med_table,
                           meal_table=meal_table,
                           activity_table=activity_table)

if __name__ == '__main__':
    app.run(debug=True)
