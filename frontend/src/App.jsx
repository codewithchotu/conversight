const BubbleBackground = () => {
  const bubbles = Array.from({ length: 15 });

  return (
    <div className="bubble-bg-container">
      {bubbles.map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            width: Math.random() * 60 + 20,
            height: Math.random() * 60 + 20,
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * 10 + "s"
          }}
        >
          <div className="bubble-glow"/>
        </div>
      ))}
    </div>
  );
};

const Waves = () => (
  <div className="waves-container">
    <div className="wave wave-1"/>
    <div className="wave wave-2"/>
  </div>
);

const Ticker = () => (
  <div className="ticker-wrap">
    <div className="ticker-content">
      {["AI","DATA","SQL","INSIGHT","ANALYTICS","CHART","INTELLIGENCE"].map((t,i)=>(
        <div key={i} className="ticker-item">{t}</div>
      ))}
    </div>
  </div>
);
import React, { useState, useRef } from "react";
import { UploadCloud, ChevronRight, RefreshCw } from "lucide-react";
import "./index.css";

const API = "https://conversight-8jxp.onrender.com";

export default function App() {

  const [isAuth, setIsAuth] = useState(false);
  const [dataset, setDataset] = useState(false);
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef();

  if (!isAuth) {
  return (
    <div className="login-screen">

      <BubbleBackground/>
      <Waves/>
      <Ticker/>

      <div className="login-card">
        <h1 className="login-logo">CONVERSIGHT</h1>
        <p className="login-subtitle">Conversational Analytics Engine</p>

        <button
          className="auth-submit-btn"
          onClick={() => setIsAuth(true)}
        >
          Enter Platform
        </button>
      </div>

    </div>
  );
}

  // CSV UPLOAD
  const upload = async (file) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API}/api/upload`, {
      method: "POST",
      body: form
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setDataset(true);
    setChat([{ type: "system", text: "Dataset Loaded Successfully 🚀" }]);
  };

  // ASK AI
  const ask = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);

    const res = await fetch(`${API}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    const data = await res.json();

    setChat(prev => [
      ...prev,
      { type: "user", text: query },
      { type: "ai", text: data.result }
    ]);

    setQuery("");
    setLoading(false);
  };

return (
  <div className="app-container">

    <BubbleBackground/>
    <Waves/>
    <Ticker/>

      {!dataset && (
        <div className="upload-hero">
          <div
            className="upload-zone"
            onClick={() => fileRef.current.click()}
          >
            <UploadCloud size={60} />
            <p>Upload CSV</p>
          </div>

          <input
            type="file"
            hidden
            ref={fileRef}
            onChange={(e) => upload(e.target.files[0])}
          />
        </div>
      )}

      {dataset && (
        <>
          <div className="chat-box">
            {chat.map((c, i) => (
              <div key={i} className={c.type}>
                {c.text}
              </div>
            ))}
          </div>

          <form className="query-bar" onSubmit={ask}>
            <input
              className="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask AI..."
            />

            <button className="query-btn">
              {loading ? <RefreshCw className="spin" /> : <ChevronRight />}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
