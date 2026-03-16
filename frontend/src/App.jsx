// IMPORTANT → THIS IS FINAL PRODUCTION VERSION

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, MessageSquare, Database, Sparkles, AlertCircle, RefreshCw, BarChart2, ChevronRight, Zap, Info, History, Menu, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE = "https://conversight-8jxp.onrender.com";

const COLORS = ['#8b5cf6', '#0ea5e9', '#2dd4bf', '#f472b6', '#3b82f6', '#f59e0b', '#ec4899'];

function App() {

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [dashboardItems, setDashboardItems] = useState([]);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const endOfChatRef = useRef(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dashboardItems]);

  // ================= UPLOAD CSV =================
  const processFile = async (selectedFile) => {

    if (!selectedFile.name.endsWith('.csv')) {
      setError("Upload CSV only");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setDatasetInfo(data);

      setDashboardItems([
        {
          type: 'system',
          content: "Dataset uploaded successfully"
        }
      ]);

    } catch (err) {
      setError(err.message);
    }

    setIsUploading(false);
  };

  // ================= QUERY =================
  const handleQuery = async (e) => {
    e.preventDefault();

    if (!query) return;

    const userQuery = query;
    setQuery('');
    setIsQuerying(true);

    setDashboardItems(prev => [...prev, {
      type: 'user',
      content: userQuery
    }]);

    try {

      const response = await fetch(`${API_BASE}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });

      const data = await response.json();

      setDashboardItems(prev => [...prev, {
        type: 'ai',
        content: data.result
      }]);

    } catch (err) {
      setDashboardItems(prev => [...prev, {
        type: 'error',
        content: err.message
      }]);
    }

    setIsQuerying(false);
  };

  // ================= UI =================
  return (
    <div className="p-10">

      {!datasetInfo && (
        <div>

          <h1>Upload CSV</h1>

          <input
            type="file"
            ref={fileInputRef}
            onChange={e => processFile(e.target.files[0])}
          />

          {isUploading && <p>Uploading...</p>}

        </div>
      )}

      {datasetInfo && (
        <div>

          <form onSubmit={handleQuery}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask about data"
            />
            <button>Ask</button>
          </form>

          {dashboardItems.map((item, i) => (
            <div key={i}>
              <b>{item.type}</b> : {item.content}
            </div>
          ))}

          <div ref={endOfChatRef} />

        </div>
      )}

    </div>
  );
}

export default App;
