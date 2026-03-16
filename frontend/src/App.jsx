import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BarChart2,
  ChevronRight,
  Zap,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "https://conversight-plum.vercel.app";

const COLORS = ["#8b5cf6", "#0ea5e9", "#2dd4bf", "#f472b6"];

const BubbleBackground = () => (
  <div className="bubble-bg-container">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="bubble"
        style={{
          width: `${Math.random() * 60 + 20}px`,
          height: `${Math.random() * 60 + 20}px`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
        }}
      />
    ))}
  </div>
);

const Waves = () => (
  <div className="waves-container">
    <div className="wave wave-1" />
    <div className="wave wave-2" />
  </div>
);

const Ticker = () => (
  <div className="ticker-wrap">
    <div className="ticker-content">
      {["AI", "DATA", "SQL", "INSIGHT", "CHART"].map((t, i) => (
        <div key={i} className="ticker-item">
          {t}
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [dataset, setDataset] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fileRef = useRef();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && pass.length > 5) setIsAuth(true);
  };

  const upload = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    setLoading(true);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setDataset(data);
    setLoading(false);

    setItems([{ type: "system", content: "Dataset Loaded 🚀" }]);
  };

  const ask = async (e) => {
    e.preventDefault();
    if (!query) return;

    const q = query;
    setQuery("");

    setItems((p) => [...p, { type: "user", content: q }]);

    const res = await fetch(`${API_BASE}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });

    const data = await res.json();

    setItems((p) => [
      ...p,
      {
        type: "chart",
        chartType: data.chartType,
        chartData: data.data,
        insight: data.insight,
        sql: data.sql,
      },
    ]);
  };

  const renderChart = (type, data) => {
    if (!data) return null;

    if (type === "pie")
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );

    if (type === "line")
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" />
          </LineChart>
        </ResponsiveContainer>
      );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (!isAuth)
    return (
      <div className="login-screen">
        <BubbleBackground />
        <Waves />
        <motion.div className="login-card">
          <Zap size={40} />
          <h1>Conversight</h1>
          <form onSubmit={handleLogin}>
            <input
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPass(e.target.value)}
            />
            <button>Login</button>
          </form>
        </motion.div>
      </div>
    );

  return (
    <div className="app-container">
      <BubbleBackground />
      <Waves />
      <Ticker />

      {!dataset && (
        <div className="upload-hero">
          <div
            className="upload-zone"
            onClick={() => fileRef.current.click()}
          >
            <UploadCloud size={40} />
            Upload CSV
          </div>
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(e) => upload(e.target.files[0])}
          />
        </div>
      )}

      {dataset && (
        <div className="chat-interface">
          {items.map((it, i) => (
            <div key={i}>
              {it.type === "user" && <div className="user">{it.content}</div>}

              {it.type === "system" && (
                <div className="system">{it.content}</div>
              )}

              {it.type === "chart" && (
                <div className="glass-panel">
                  {renderChart(it.chartType, it.chartData)}
                  <div className="insight-card">{it.insight}</div>
                  <details>
                    <summary>SQL</summary>
                    <pre>{it.sql}</pre>
                  </details>
                </div>
              )}
            </div>
          ))}

          <form onSubmit={ask} className="query-bar">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask data..."
            />
            <button>
              <ChevronRight />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
