import React, { useState } from "react";
import { UploadCloud, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";
import "./index.css";

const API = "https://conversight-8jxp.onrender.com";

const COLORS = ["#8b5cf6", "#0ea5e9", "#2dd4bf", "#f472b6"];

export default function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [query, setQuery] = useState("");
  const [chartData, setChartData] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadCSV = async () => {
    if (!file) return alert("Upload CSV first");

    const form = new FormData();
    form.append("file", file);

    setLoading(true);

    const res = await fetch(`${API}/api/upload`, {
      method: "POST",
      body: form
    });

    const data = await res.json();
    setUploaded(true);
    setLoading(false);
  };

  const askAI = async () => {
    if (!query) return;

    setLoading(true);

    const res = await fetch(`${API}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();

    setResult(data.result);

    // FAKE PIE DATA GENERATOR (until AI returns structured chart)
    setChartData([
      { name: "A", value: 400 },
      { name: "B", value: 300 },
      { name: "C", value: 200 },
      { name: "D", value: 100 }
    ]);

    setLoading(false);
  };

  return (
    <div className="app-container">

      {!uploaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel upload-hero"
        >
          <UploadCloud size={80} className="upload-icon" />

          <h1>Conversight</h1>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button className="query-btn" onClick={uploadCSV}>
            Upload Dataset
          </button>
        </motion.div>
      )}

      {uploaded && (
        <>
          <div className="chat-interface">

            <h1 className="logo-text-glow">Conversight Dashboard</h1>

            {chartData && (
              <div className="glass-panel chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {result && (
              <div className="glass-panel">
                <h2>AI Insight</h2>
                <p>{result}</p>
              </div>
            )}

          </div>

          <div className="query-bar">
            <input
              className="query-input"
              placeholder="Ask AI about dataset..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="query-btn" onClick={askAI}>
              <ChevronRight />
            </button>
          </div>
        </>
      )}

      {loading && <p style={{ textAlign: "center" }}>AI Processing...</p>}

    </div>
  );
}
