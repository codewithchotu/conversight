import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Database,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BarChart2,
  ChevronRight,
  Zap,
  Info,
  History,
  Menu,
  Plus,
  X
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
  ResponsiveContainer
} from "recharts";

const API_BASE = "https://conversight-8jxp.onrender.com";

const COLORS = [
  "#8b5cf6",
  "#0ea5e9",
  "#2dd4bf",
  "#f472b6",
  "#3b82f6",
  "#f59e0b",
  "#ec4899"
];

const BubbleBackground = () => {
  const bubbles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: Math.random() * 10 + 15
  }));

  return (
    <div className="bubble-bg-container">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`
          }}
        >
          <div className="bubble-glow" />
        </div>
      ))}
    </div>
  );
};

const Waves = () => (
  <div className="waves-container">
    <div className="wave wave-1" />
    <div className="wave wave-2" />
  </div>
);

function App() {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [dashboardItems, setDashboardItems] = useState([]);
  const [query, setQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const fileRef = useRef();

  const handleLogin = e => {
    e.preventDefault();
    if (email && pass.length >= 6) {
      setIsAuthenticated(true);
    } else {
      setError("Enter valid login (demo)");
    }
  };

  const uploadCSV = async file => {
    if (!file) return;
    setIsUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: fd
      });
      const data = await res.json();

      setDatasetInfo(data);

      setDashboardItems([
        {
          type: "system",
          content: `Dataset ${file.name} uploaded 🚀`
        }
      ]);
    } catch (e) {
      setError("Upload failed");
    }

    setIsUploading(false);
  };

  const handleQuery = async e => {
    e.preventDefault();
    if (!query) return;

    const q = query;
    setQuery("");

    setDashboardItems(prev => [...prev, { type: "user", content: q }]);

    setIsQuerying(true);

    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });

      const data = await res.json();

      let chartType = "bar";

      if (data.result.includes("pie")) chartType = "pie";
      if (data.result.includes("trend")) chartType = "line";
      if (data.result.includes("total")) chartType = "number";

      setDashboardItems(prev => [
        ...prev,
        {
          type: "chart",
          chartType,
          content: data.result
        }
      ]);
    } catch (e) {
      setError("Query failed");
    }

    setIsQuerying(false);
  };

const extractChartData = (text) => {
  const numbers = text.match(/\d+/g);

  if (!numbers) return null;

  return numbers.map((n, i) => ({
    name: "Item " + (i + 1),
    value: Number(n)
  }));
};

const renderChart = (text) => {
  const data = extractChartData(text);

  if (!data) return null;

  if (text.toLowerCase().includes("pie"))
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );

  if (text.toLowerCase().includes("trend") || text.toLowerCase().includes("over time"))
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <Line dataKey="value" stroke="#8b5cf6" />
        </LineChart>
      </ResponsiveContainer>
    );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <Bar dataKey="value" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

  if (!isAuthenticated)
    return (
      <div className="login-screen">
        <BubbleBackground />
        <Waves />

        <form onSubmit={handleLogin} className="login-card">
          <h1 className="login-logo">CONVERSIGHT</h1>

          <input
            placeholder="email"
            className="auth-input"
            onChange={e => setEmail(e.target.value)}
          />
          <input
            placeholder="password"
            className="auth-input"
            type="password"
            onChange={e => setPass(e.target.value)}
          />

          <button className="auth-submit-btn">Login</button>

          {error && <p className="text-red-400">{error}</p>}
        </form>
      </div>
    );

  return (
    <div className="app-container">
      <BubbleBackground />
      <Waves />

      {!datasetInfo && (
        <div className="upload-hero">
          <div
            className="upload-zone"
            onClick={() => fileRef.current.click()}
          >
            <UploadCloud />
            <p>Upload CSV</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={e => uploadCSV(e.target.files[0])}
          />
        </div>
      )}

      {datasetInfo && (
        <>
          <div className="space-y-6">
            {dashboardItems.map((item, i) => (
              <div key={i} className="glass-panel">
                {item.type === "user" && <p>{item.content}</p>}
                {item.type === "system" && <p>{item.content}</p>}
                {item.type === "chart" && (
                  <>
                    <p>{item.content}</p>
                    {renderChart(item.content)}
                  </>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleQuery} className="query-bar">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="query-input"
            />
            <button className="query-btn">
              <ChevronRight />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
