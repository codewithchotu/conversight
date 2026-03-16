import React, { useState, useRef } from "react";

const API_BASE = "https://conversight-8jxp.onrender.com";

function App() {
  const [datasetLoaded, setDatasetLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  // ================= UPLOAD CSV =================
  const uploadCSV = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Upload CSV only");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setDatasetLoaded(true);

      setMessages([
        { type: "system", text: "✅ Dataset uploaded successfully" },
      ]);
    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  // ================= QUERY =================
  const askQuery = async (e) => {
    e.preventDefault();
    if (!query) return;

    const userQuery = query;
    setQuery("");

    setMessages((prev) => [
      ...prev,
      { type: "user", text: userQuery },
    ]);

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { type: "ai", text: data.result },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "error", text: err.message },
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Conversight AI</h1>

      {!datasetLoaded && (
        <>
          <h2>Upload CSV</h2>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => uploadCSV(e.target.files[0])}
          />
        </>
      )}

      {datasetLoaded && (
        <>
          <form onSubmit={askQuery}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about dataset..."
              style={{ width: 300 }}
            />
            <button>Ask</button>
          </form>

          {loading && <p>Thinking...</p>}

          <div style={{ marginTop: 20 }}>
            {messages.map((m, i) => (
              <p key={i}>
                <b>{m.type}:</b> {m.text}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
