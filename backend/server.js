// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 8080;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- CORS ---
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// --- File upload (txt only) ---
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain") cb(null, true);
    else cb(new Error("Only .txt files are allowed."));
  },
});

app.post("/api/upload", upload.single("transcript"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filePath = path.join(process.cwd(), req.file.path);
    const text = fs.readFileSync(filePath, "utf-8");
    fs.unlinkSync(filePath); // clean up temp
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read file" });
  }
});

// --- Summarize with Groq ---
app.post("/api/summarize", async (req, res) => {
  try {
    const { transcriptText, prompt } = req.body;
    if (!transcriptText?.trim())
      return res.status(400).json({ error: "transcriptText is required" });

    const instruction =
      prompt?.trim() || "Summarize in clear bullet points with headings.";

    const sys = `You are an expert meeting/call summarizer.
Return clean, structured, concise output.
Prefer headings + bullet points. Respect the user's instruction exactly.
If action items exist, extract them into a dedicated section with assignee and due date if present.`;

    const model = "llama3-70b-8192";

    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 1500,
      messages: [
        { role: "system", content: sys },
        {
          role: "user",
          content: `Instruction: ${instruction}\n\nTranscript:\n${transcriptText}`,
        },
      ],
    });

    const summary = completion.choices?.[0]?.message?.content?.trim() || "";
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed" });
  }
});

// --- Share (No Email, Just Response or File Download) ---
app.post("/api/share", async (req, res) => {
  try {
    const { recipients, subject, summary } = req.body;

    if (!summary?.trim())
      return res.status(400).json({ error: "summary is required" });

    // Instead of sending email, just return JSON
    res.json({
      ok: true,
      message: "Summary shared successfully (no email sent).",
      recipients: recipients || [],
      subject: subject || "Meeting Summary",
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sharing failed" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
