import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Database, Sparkles, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css'

const API_BASE = "https://conversight-8jxp.onrender.com";

function App() {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [query, setQuery] = useState('');
  const [dashboardItems, setDashboardItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const endOfChatRef = useRef(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dashboardItems]);

  // ================= UPLOAD CSV =================
  const processFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setError("Upload CSV only");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setDatasetInfo(data);

      setDashboardItems([
        { type: 'system', content: "Dataset uploaded successfully 🚀" }
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
      const res = await fetch(`${API_BASE}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });

      const data = await res.json();

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

  return (
    <div className="min-h-screen bg-black text-white p-10">

      {!datasetInfo && (
        <div className="text-center mt-20">

          <h1 className="text-6xl font-bold mb-10">Conversight AI</h1>

          <div
            className="border-2 border-dashed border-gray-600 p-20 cursor-pointer hover:border-purple-500"
            onClick={() => fileInputRef.current.click()}
          >
            <UploadCloud size={50} className="mx-auto mb-5"/>
            <p className="text-xl">Upload CSV</p>

            {isUploading && <p className="mt-4 text-purple-400">Uploading...</p>}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={(e) => processFile(e.target.files[0])}
          />

          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      )}

      {datasetInfo && (
        <div>

          <h1 className="text-4xl font-bold mb-10">Conversight Dashboard</h1>

          <div className="space-y-6">

            {dashboardItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                {item.type === 'system' && (
                  <div className="bg-purple-900/20 p-6 rounded-xl">
                    <Sparkles className="inline mr-2"/> {item.content}
                  </div>
                )}

                {item.type === 'user' && (
                  <div className="text-right">
                    <div className="inline-block bg-purple-600 px-6 py-3 rounded-xl">
                      {item.content}
                    </div>
                  </div>
                )}

                {item.type === 'ai' && (
                  <div className="bg-gray-900 p-6 rounded-xl whitespace-pre-line">
                    {item.content}
                  </div>
                )}

                {item.type === 'error' && (
                  <div className="bg-red-900/20 p-6 rounded-xl">
                    <AlertCircle className="inline mr-2"/> {item.content}
                  </div>
                )}

              </motion.div>
            ))}

            {isQuerying && (
              <div className="flex items-center gap-3">
                <RefreshCw className="animate-spin"/> AI thinking...
              </div>
            )}

            <div ref={endOfChatRef}/>
          </div>

          <form onSubmit={handleQuery} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-2/3 bg-gray-900 rounded-xl flex">
            <input
              className="flex-1 p-5 bg-transparent outline-none"
              placeholder="Ask about dataset..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="p-5 bg-purple-600 rounded-r-xl">
              <ChevronRight/>
            </button>
          </form>

        </div>
      )}

    </div>
  );
}

export default App;
