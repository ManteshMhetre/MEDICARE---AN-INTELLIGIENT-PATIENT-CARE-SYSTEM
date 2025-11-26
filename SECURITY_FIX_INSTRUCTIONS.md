# 🔐 SECURITY FIX REQUIRED - Remove Hardcoded Secrets

## ⚠️ GitHub Push Protection Issue

GitHub has blocked your push because it detected hardcoded API keys in your code. I've fixed most Python files, but you need to manually fix the Jupyter notebook files.

---

## ✅ Files Already Fixed

The following files have been updated to use environment variables:

1. ✅ `app.py` (root)
2. ✅ `Models/Reports/app2.py`
3. ✅ `Models/Cataract eye disease detection/app.py`
4. ✅ `Models/Patient side and doctor/ai_care_prescription/app.py.txt`

---

## 🔧 Files You Need to Fix Manually

### **1. Day_Care_Plan_Creation.ipynb** (Line 67)

**Open the notebook and find this line:**
```python
client = Groq(api_key='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')
```

**Replace it with:**
```python
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv('GROQ_API_KEY'))
```

---

### **2. RAG (1).ipynb** (Root directory - Line 3908)

**Find this line:**
```python
GROQ_API_KEY = "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"
```

**Replace it with:**
```python
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
```

---

### **3. Models/Predictive Analytics/RAG (1).ipynb** (Line 1)

**Find this cell:**
```python
GROQ_API_KEY = "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"
PINECONE_API_KEY = "pcsk_45FE9b_Tfu3NVkFqAwBT2qQBvEeVA36ab8HJXpq2VgDWyWnP4o2WWakAi5yDiEitMiexKu"
index_name = "cavistahack"
```

**Replace it with:**
```python
import os
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
index_name = "cavistahack"
```

---

## 📝 Environment Variables Setup

I've created a `.env` file in the root directory. **Add your actual API keys:**

```env
# Flask Configuration
FLASK_SECRET_KEY=supersecretkey

# Google Gemini API
GENAI_API_KEY=your_actual_gemini_api_key

# Groq API
GROQ_API_KEY=your_actual_groq_api_key

# Pinecone API
PINECONE_API_KEY=your_actual_pinecone_api_key

# Twilio WhatsApp Configuration
TWILIO_WHATSAPP_ACCOUNT_SID=your_actual_twilio_sid
TWILIO_WHATSAPP_AUTH_TOKEN=your_actual_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PATIENT_PHONE=whatsapp:+917559355282
```

---

## 🚀 Steps to Fix and Push to GitHub

### **Step 1: Install python-dotenv** (if not already installed)
```cmd
pip install python-dotenv
```

### **Step 2: Update Your .env File**
Edit `d:\cavista-vedaverse-master\.env` and add your real API keys.

### **Step 3: Fix the Jupyter Notebooks**
Manually edit the 3 notebook files mentioned above using Jupyter or VS Code.

### **Step 4: Remove Secrets from Git History**

You need to remove the committed secrets from git history:

```cmd
cd d:\cavista-vedaverse-master

# Option 1: Remove from last commit (if you just committed)
git reset --soft HEAD~1
git add .
git commit -m "fix: Remove hardcoded API keys and use environment variables"
git push origin main --force

# Option 2: If the commit is already pushed, use this
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.py Models/Reports/app2.py" \
  --prune-empty --tag-name-filter cat -- --all

git push origin main --force
```

**⚠️ WARNING:** `--force` will rewrite history. If others are working on this repo, coordinate with them first.

### **Step 5: Add and Commit Changes**
```cmd
git add .
git commit -m "fix: Remove hardcoded API keys, use environment variables for security"
git push origin main
```

### **Step 6: If Still Blocked**

If GitHub still blocks your push, you can:

**Option A: Allow the secret** (Not recommended for public repos)
- Click the URL provided by GitHub
- Example: `https://github.com/ManteshMhetre/MEDICARE---AN-INTELLIGIENT-PATIENT-CARE-SYSTEM/security/secret-scanning/unblock-secret/...`
- This temporarily allows the push

**Option B: Clean Git History** (Recommended)
```cmd
# Install BFG Repo Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove secrets from history
java -jar bfg.jar --replace-text passwords.txt

# passwords.txt should contain:
# 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
# AIzaSyD54ejbjVIVa-F3aD_Urnp8m1EFLUGR__I
# AC490e071f8d01bf0df2f03d086c788d87
# 224b23b950ad5a4052aba15893fdf083

# Then force push
git push origin main --force
```

---

## 🔒 Security Best Practices

### **DO:**
- ✅ Store API keys in `.env` files
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use `os.getenv()` to read keys
- ✅ Never commit `.env` files
- ✅ Use different keys for development and production
- ✅ Rotate compromised API keys immediately

### **DON'T:**
- ❌ Never hardcode API keys in code
- ❌ Never commit secrets to GitHub
- ❌ Never share `.env` files publicly
- ❌ Never use production keys in notebooks

---

## 🔄 After Fixing

Once you've completed all steps:

1. ✅ All API keys moved to `.env`
2. ✅ All Python files use `os.getenv()`
3. ✅ All notebook cells updated
4. ✅ Git history cleaned
5. ✅ Successfully pushed to GitHub

---

## ❓ Need Help?

If you're still having issues:

1. **Regenerate API Keys**: Since these keys are now public, generate new ones:
   - Groq: https://console.groq.com/keys
   - Gemini: https://makersuite.google.com/app/apikey
   - Twilio: https://console.twilio.com/
   - Pinecone: https://app.pinecone.io/

2. **Check Git History**: Verify secrets are removed:
   ```cmd
   git log --all --full-history -- "*app.py"
   ```

3. **Contact GitHub Support** if push protection persists after cleanup.

---

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/code-security/secret-scanning)
- [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git Filter Branch](https://git-scm.com/docs/git-filter-branch)
- [Python dotenv](https://pypi.org/project/python-dotenv/)

---

**Remember:** Security is not optional. Always protect your API keys! 🔐
