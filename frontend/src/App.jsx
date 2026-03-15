import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, MessageSquare, Database, Sparkles, AlertCircle, RefreshCw, BarChart2, ChevronRight, Zap, Info, History, Menu, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Theme Colors for Charts
const COLORS = ['#8b5cf6', '#0ea5e9', '#2dd4bf', '#f472b6', '#3b82f6', '#f59e0b', '#ec4899'];

// Water Bubble Background Component
const BubbleBackground = () => {
  const bubbles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: Math.random() * 10 + 15,
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

// Live Data Ticker Component
const BackgroundTicker = () => {
  const stocks = [
    { s: 'AAPL', v: '182.41', c: '+1.2%', up: true },
    { s: 'GOOGL', v: '142.71', c: '-0.4%', up: false },
    { s: 'TSLA', v: '193.57', c: '+2.8%', up: true },
    { s: 'MSFT', v: '404.22', c: '+0.1%', up: true },
    { s: 'AMZN', v: '174.45', c: '-1.1%', up: false },
    { s: 'NVDA', v: '726.13', c: '+4.5%', up: true },
    { s: 'META', v: '484.03', c: '-0.3%', up: false },
    { s: 'BTC', v: '52,142', c: '+2.1%', up: true },
    { s: 'ETH', v: '2,814', c: '+1.5%', up: true },
  ];
  
  // Duplicate for infinite scroll effect
  const tickerItems = [...stocks, ...stocks, ...stocks, ...stocks];

  return (
    <>
      <div className="ticker-wrap">
        <div className="ticker-content">
          {tickerItems.map((item, idx) => (
            <div key={idx} className="ticker-item">
              <span className="ticker-symbol">{item.s}</span>
              <span className="ticker-value">{item.v}</span>
              <span className={`ticker-change ${item.up ? 'up' : 'down'}`}>
                {item.up ? '▲' : '▼'} {item.c}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="ticker-overlay" />
    </>
  );
};

// Waves Component
const Waves = () => (
  <div className="waves-container">
    <div className="wave wave-1" />
    <div className="wave wave-2" />
  </div>
);

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('conversight_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(() => Date.now().toString());
  
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [dashboardItems, setDashboardItems] = useState([]);
  const [error, setError] = useState(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({ columns: [], values: {} });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const endOfChatRef = useRef(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dashboardItems, isQuerying]);

  const refreshFilters = async () => {
    if (!datasetInfo) return;
    try {
      const filterRes = await fetch('http://localhost:3001/api/filters');
      const filterData = await filterRes.json();
      setAvailableFilters(filterData);
    } catch (e) {
      console.error("Failed to refresh filters:", e);
    }
  };

  useEffect(() => {
    if (datasetInfo && availableFilters.columns.length === 0) {
      refreshFilters();
    }
  }, [datasetInfo]);

  useEffect(() => {
    if (dashboardItems.length > 0) {
      const updatedHistory = [...chatHistory];
      const existingIdx = updatedHistory.findIndex(s => s.id === currentSessionId);
      
      const sessionData = {
        id: currentSessionId,
        title: dashboardItems.find(item => item.type === 'user')?.content || 'New Analysis',
        timestamp: new Date().toLocaleString(),
        items: dashboardItems,
        dataset: datasetInfo
      };

      if (existingIdx > -1) {
        updatedHistory[existingIdx] = sessionData;
      } else {
        updatedHistory.unshift(sessionData);
      }
      
      setChatHistory(updatedHistory);
      localStorage.setItem('conversight_chat_history', JSON.stringify(updatedHistory.slice(0, 20))); // Keep last 20
    }
  }, [dashboardItems]);

  const createNewChat = () => {
    setCurrentSessionId(Date.now().toString());
    setDashboardItems([]);
    setDatasetInfo(null);
    setAvailableFilters({ columns: [], values: {} });
    setActiveFilters({});
    setIsHistoryOpen(false);
  };

  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setDashboardItems(session.items);
    setDatasetInfo(session.dataset);
    setIsHistoryOpen(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (userEmail.trim() && password.length >= 6) {
      setIsAuthenticated(true);
    } else {
      setError("Please enter a valid email and 6+ character password (Demo Mode)");
      setTimeout(() => setError(null), 3000);
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file.");
      return;
    }
    setFile(selectedFile);
    setIsUploading(true);
    setIsDragging(false);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload file');
      setDatasetInfo({ tableName: data.tableName, schema: data.schema, filename: selectedFile.name });
      
      // Fetch available filters after upload
      const filterRes = await fetch('http://localhost:3001/api/filters');
      const filterData = await filterRes.json();
      setAvailableFilters(filterData);

      setDashboardItems([{
        type: 'system',
        content: `Dataset "${selectedFile.name}" successfully loaded. Your AI insights engine is online.`
      }]);
    } catch (err) {
      setError(err.message);
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !datasetInfo) return;
    const userQuery = query.trim();
    setQuery('');
    setError(null);
    setIsQuerying(true);
    const newItemId = Date.now();
    setDashboardItems(prev => [...prev, { id: newItemId, type: 'user', content: userQuery }]);
    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, activeFilters }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process query');
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((result, index) => {
          setDashboardItems(prev => [...prev, {
            id: newItemId + 1 + index,
            type: result.error ? 'error' : 'ai_chart',
            queryOrigin: userQuery,
            data: result.data,
            chartConfig: result.chartConfig,
            sql: result.sql,
            thoughts: result.thoughts,
            content: result.error
          }]);
        });
      }
    } catch (err) {
      setDashboardItems(prev => [...prev, { id: newItemId + 1, type: 'error', content: err.message }]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleFilterToggle = (column, value) => {
    setActiveFilters(prev => {
        const current = prev[column] || [];
        const next = current.includes(value) 
            ? current.filter(v => v !== value)
            : [...current, value];
        
        const newFilters = { ...prev };
        if (next.length === 0) {
            delete newFilters[column];
        } else {
            newFilters[column] = next;
        }
        return newFilters;
    });
    
    // Improved auto-scroll to results when filters are touched
    // We scroll to the first ai_chart element or the end of chat
    setTimeout(() => {
        const results = document.querySelectorAll('.glass-panel.group');
        if (results.length > 0) {
          results[results.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, 150);
  };

  const exportToCSV = (item) => {
    if (!item.data) return;
    const headers = Object.keys(item.data[0]).join(',');
    const rows = item.data.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `conversight_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderChart = (item) => {
    const { data, chartConfig } = item;
    if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">No data available</div>;

    switch (chartConfig.type?.toLowerCase()) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={chartConfig.xAxis} stroke="#64748b" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey={chartConfig.yAxis} stroke={COLORS[0]} strokeWidth={4} dot={{ r: 4, fill: COLORS[0], strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}
                dataKey={chartConfig.yAxis || chartConfig.value} nameKey={chartConfig.xAxis} label
              >
                {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'number':
        const val = data[0] ? Object.values(data[0])[0] : 'N/A';
        return (
          <div className="flex items-center justify-center h-full">
            <motion.h2 
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-bold bg-gradient-to-br from-violet-400 to-blue-500 bg-clip-text text-transparent"
            >
              {val}
            </motion.h2>
          </div>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={chartConfig.xAxis} stroke="#64748b" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey={chartConfig.yAxis} fill={COLORS[1]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <BubbleBackground />
        <Waves />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="login-card"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
              <Zap className="text-violet-500" size={32} />
            </div>
          </div>
          <h1 className="login-logo italic">CONVERSIGHT</h1>
          <p className="login-subtitle">Secure access to conversational analytics</p>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Business Email</label>
              <input 
                type="email" 
                className="auth-input" 
                placeholder="name@company.com"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input 
                type="password" 
                className="auth-input" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-xs flex items-center gap-2 justify-center"
              >
                <AlertCircle size={12} /> {error}
              </motion.div>
            )}

            <button type="submit" className="auth-submit-btn">
              Authenticate
            </button>
          </form>

          <div className="login-footer">
            Don't have access? <span>Request Demo</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BubbleBackground />
      <Waves />
      <BackgroundTicker />
      
      <header className="header-section">
        <motion.div 
          initial={{ x: -20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className="branding-group"
        >
          <div>
            <h1 className="text-6xl font-bold tracking-tight mb-2 text-white logo-text-glow">Conversight</h1>
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-white" />
              <span className="text-lg font-bold tracking-wide text-theme-bright opacity-90">Conversational Analytics Engine</span>
            </div>
          </div>
        </motion.div>
        
        {datasetInfo && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            className="tag flex items-center gap-3 px-6 py-3"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_#10b981]" />
            <span className="font-mono text-sm opacity-80">{datasetInfo.filename}</span>
          </motion.div>
        )}
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {!datasetInfo ? (
          <div className="upload-hero">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-12 max-w-2xl w-full text-center"
            >
              <h2 className="text-4xl mb-4 font-bold">Unleash your data's potential</h2>
              <p className="text-slate-400 mb-10 text-lg">Upload a CSV to generate instant insights, interactive charts, and natural language analytics.</p>
              
              <div 
                className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
                <div className={isDragging ? 'pointer-events-none' : ''}>
                    <UploadCloud className="upload-icon" />
                    <h3 className="text-xl font-semibold mb-2">{isUploading ? 'Preparing Engine...' : 'Drop Dataset Here'}</h3>
                    <p className="text-sm text-slate-500">CSV files supported up to 50MB</p>
                </div>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-[24px] flex flex-col items-center justify-center pointer-events-none">
                    <RefreshCw className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                    <p className="font-medium">Building SQL Index...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col pt-8 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-4 space-y-12 scrollbar-hide pb-48">
              <AnimatePresence>
                {dashboardItems.map((item, idx) => (
                  <motion.div 
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                  >
                    {item.type === 'system' && (
                      <div className="glass-panel border-violet-500/20 bg-violet-500/5 text-center py-8">
                        <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                        <h3 className="text-xl font-semibold mb-2">Engine Synchronized</h3>
                        <p className="text-slate-400">{item.content}</p>
                        <div className="mt-10">
                  <div className="flex flex-wrap justify-center gap-x-16 gap-y-14">
                    {datasetInfo.schema.map((col, i) => (
                      <span key={i} className="tag truncate max-w-[300px]" title={col}>{col}</span>
                    ))}
                  </div>
                </div>
                      </div>
                    )}

                    {item.type === 'user' && (
                      <div className="flex justify-end">
                        <div className="glass-panel bg-gradient-to-br from-violet-600/80 to-blue-600/80 border-none px-6 py-3 max-w-[80%]">
                           <p className="font-medium text-white">{item.content}</p>
                        </div>
                      </div>
                    )}

                    {item.type === 'ai_chart' && (() => {
                      const filteredData = item.data?.filter(row => {
                        return Object.entries(activeFilters).every(([col, values]) => {
                          const cellValue = row[col] === null || row[col] === undefined ? "" : String(row[col]);
                          return values.includes(cellValue);
                        });
                      });

                      return (
                        <div className="glass-panel space-y-6 group">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                               <BarChart2 className="text-violet-400" size={18} /> {item.queryOrigin}
                               {Object.keys(activeFilters).length > 0 && <span className="text-[10px] bg-violet-500/20 px-2 py-0.5 rounded-full text-violet-300">Filtered</span>}
                            </h3>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => exportToCSV({ ...item, data: filteredData })}
                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
                                title="Export Filtered Data"
                              >
                                <UploadCloud size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="chart-wrapper">
                            {renderChart({ ...item, data: filteredData })}
                          </div>

                          <div className="insight-card p-4 rounded-xl flex gap-3">
                            <Info className="text-violet-400 shrink-0" size={18} />
                            <p className="text-slate-300 text-sm italic">{item.thoughts}</p>
                          </div>
                          
                          <details className="mt-4">
                            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">Query Fingerprint</summary>
                            <pre className="mt-2 p-4 bg-black/40 rounded-lg text-[10px] text-emerald-400 overflow-x-auto border border-white/5">
                              {item.sql}
                            </pre>
                          </details>
                        </div>
                      );
                    })()}

                    {item.type === 'error' && (
                      <div className="glass-panel border-rose-500/30 bg-rose-500/5 p-6 space-y-2">
                        <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={18} className="text-white" />
              <span className="text-lg font-bold tracking-wide text-white opacity-90">Conversational Analytics Engine</span>
            </div>
                        <p className="text-slate-400">{item.content}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isQuerying && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass-panel w-fit flex items-center gap-3 px-6 py-4"
                  >
                    <RefreshCw className="animate-spin text-violet-400" size={18} />
                    <span className="text-slate-400 font-medium tracking-wide">Synthesizing insights...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endOfChatRef} />
            </div>
          </div>
        )}
      </main>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && datasetInfo && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-80 glass-panel border-l border-white/10 z-[200] rounded-none p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2 italic">
                  <Database size={20} className="text-violet-400" /> Conversight Filters
                </h3>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-10 pr-2 scrollbar-hide py-4">
                {availableFilters.columns.length > 0 ? (
                  availableFilters.columns.map((col, idx) => (
                    <motion.div 
                      key={col} 
                      className="space-y-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <h4 className="filter-section-header">{col}</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {availableFilters.values[col].map(val => (
                          <button
                            key={val}
                            onClick={() => handleFilterToggle(col, val)}
                            className={`filter-pill ${activeFilters[col]?.includes(val) ? 'active' : ''}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <Database size={48} className="text-slate-600 animate-pulse" />
                    <p className="text-sm">No categorical filters identified for this dataset yet.</p>
                    <button 
                      onClick={refreshFilters}
                      className="text-xs text-violet-400 hover:text-white underline"
                    >
                      Try Refreshing
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <button 
                  onClick={() => setActiveFilters({})}
                  className="w-full py-3 bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* History Sidebar */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="history-sidebar"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2 italic">
                  <History size={20} className="text-violet-400" /> Analysis History
                </h3>
                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <button 
                onClick={createNewChat}
                className="w-full py-3 mb-8 bg-violet-600/20 border border-violet-500/30 rounded-xl text-sm font-semibold text-violet-300 hover:bg-violet-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> New Analysis
              </button>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
                {chatHistory.length > 0 ? (
                  chatHistory.map(session => (
                    <div 
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`history-item ${currentSessionId === session.id ? 'active' : ''}`}
                    >
                      <span className="history-title">{session.title}</span>
                      <span className="history-date">{session.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-40">
                    <History size={40} className="mx-auto mb-3" />
                    <p className="text-sm">No history yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsHistoryOpen(true)}
        className="history-toggle"
        title="View Analysis History"
      >
        <Menu size={20} className="text-violet-400" />
      </button>

      {datasetInfo && (
        <button 
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className={`filter-side-tab ${isSidebarOpen ? 'active' : ''}`}
        >
          <span className="flex items-center gap-2">
            <Database size={14} className={isSidebarOpen ? 'rotate-90 transition-transform' : ''} />
            FILTERS
          </span>
        </button>
      )}

      {datasetInfo && (
        <form onSubmit={handleQuerySubmit} className="query-bar">
          <Database className="ml-4 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Ask anything about your dataset..." 
            className="query-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={isQuerying}
          />
          <button type="submit" className="query-btn" disabled={!query.trim() || isQuerying}>
            <ChevronRight size={24} />
          </button>
        </form>
      )}

      {/* Global CSS Inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export default App;
