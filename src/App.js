import React, { useState, useRef } from 'react';

const API_BASE = 'http://localhost:8080';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('Summarize in bullet points for executives');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('Meeting Summary');
  const fileRef = useRef(null);

  const onUploadTxt = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('transcript', file);
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setTranscript(data.text || '');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const generateSummary = async () => {
    if (!transcript.trim()) {
      alert('Please paste a transcript or upload a .txt file.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptText: transcript, prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Summarization failed');
      setSummary(data.summary || '');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    const recipients = emails
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);
    if (recipients.length === 0) {
      alert('Enter at least one recipient email, separated by commas.');
      return;
    }
    if (!summary.trim()) {
      alert('Summary is empty—generate or write something first.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, subject, summary })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Email sending failed');
      alert('Email sent!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui' }}>
      <h1>AI Meeting Notes Summarizer</h1>
      <p style={{ color: '#555' }}>Upload or paste your transcript, add a custom instruction, generate a summary, edit it, and share via email.</p>

      <section style={{ marginTop: 24 }}>
        <h2>1) Upload (.txt) or Paste Transcript</h2>
        <input ref={fileRef} type="file" accept=".txt" onChange={onUploadTxt} disabled={loading} />
        <textarea
          placeholder="Paste transcript here..."
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          rows={10}
          style={{ width: '100%', marginTop: 8 }}
        />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>2) Custom Instruction / Prompt</h2>
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder='e.g., "Highlight only action items with owners and due dates"'
          style={{ width: '100%' }}
        />
        <button onClick={generateSummary} disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Working...' : 'Generate Summary'}
        </button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>3) Edit Summary</h2>
        <textarea
          placeholder="Generated summary will appear here; you can edit freely."
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={14}
          style={{ width: '100%' }}
        />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>4) Share via Email</h2>
        <input
          type="text"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          placeholder="recipient1@example.com, recipient2@example.com"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Email subject"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button onClick={sendEmail} disabled={loading}>
          {loading ? 'Sending...' : 'Send Summary'}
        </button>
      </section>

      <footer style={{ marginTop: 40, color: '#777' }}>
        <small>Status: {loading ? 'Busy' : 'Idle'} • API: {API_BASE}</small>
      </footer>
    </div>
  );
}
