# 📄 AI Meeting Summarizer

An AI-powered meeting summarizer that helps you quickly generate and share concise meeting notes.

## 🚀 Features
- Accepts meeting transcripts (paste text or upload `.txt` files)
- Custom instructions (e.g., *"Make action items bullet points"*)
- Uses **Groq LLM API** to generate smart summaries
- Manual editing before sending
- Send summaries via email (mocked – no SMTP cost!)
---
##  Live Demo
- **Backend (API):** [https://mongodesk.onrender.com/](https://mongodesk.onrender.com/)  
- **Frontend (User Interface):** [https://mongodesk.vercel.app/](https://mongodesk.vercel.app/)

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express
- **AI/LLM:** Groq API
- **Frontend:** React
- **Other:** Multer (file upload), Nodemailer (mock email)

## 📦 Installation
```bash
# Clone the repo
git clone https://github.com/your-username/ai-meeting-summarizer.git
cd ai-meeting-summarizer

# Install dependencies
npm install
```
## 📂 Project Structure
```bash
meeting-summarizer/
│── backend/
│   ├── server.js         # Express server
│   ├── package.json
│   └── .env              # GROQ_API_KEY
│
│── frontend/
│   ├── src/
│   │   └── App.jsx       # React frontend
│   ├── package.json
│   └── .env              # VITE_API_BASE
│
└── README.md
```
### 🧪 API Endpoints
```bash
POST /summarize

Generates a summary from transcript + custom prompt.

{
  "transcript": "Meeting transcript text...",
  "instruction": "Summarize into 5 bullet points"
}


Response:

{
  "summary": "AI generated summary text..."
}

POST /send-summary

Mocks sending the summary via email.

{
  "to": ["test@example.com"],
  "subject": "Meeting Summary",
  "body": "AI generated summary..."
}


Response:

{
  "success": true,
  "message": "Summary sent successfully"
}
```


