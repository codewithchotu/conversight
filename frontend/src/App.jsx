import { useState } from "react";

const API = "https://conversight-8jxp.onrender.com";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadCSV = async () => {
    if (!file) return alert("Select CSV first");

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        body: form
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUploaded(true);
      alert("Dataset uploaded 🚀");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    if (!query) return;

    try {
      setLoading(true);
      setResult("");
      setError("");

      const res = await fetch(`${API}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setResult(data.result);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Conversight Dashboard</h1>

      {/* Upload Section */}
      <div style={styles.card}>
        <h2>Upload Dataset</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button style={styles.btn} onClick={uploadCSV}>
          Upload CSV
        </button>

        {uploaded && <p style={styles.success}>Dataset uploaded successfully 🚀</p>}
      </div>

      {/* Query Section */}
      <div style={styles.card}>
        <h2>Ask AI</h2>
        <input
          style={styles.input}
          placeholder="Ask about dataset..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button style={styles.btn} onClick={askAI}>
          Analyze
        </button>
      </div>

      {/* Loading */}
      {loading && <p style={styles.loading}>Analyzing AI...</p>}

      {/* Error */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Result */}
      {result && (
        <div style={styles.result}>
          <h3>AI Insight</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#0b0b0b",
    minHeight: "100vh",
    padding: 40,
    color: "white",
    fontFamily: "sans-serif"
  },
  title: {
    fontSize: 50,
    marginBottom: 30
  },
  card: {
    background: "#121212",
    padding: 25,
    borderRadius: 10,
    marginBottom: 20,
    border: "1px solid #222"
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    border: "none",
    background: "#1f1f1f",
    color: "white"
  },
  btn: {
    marginTop: 10,
    padding: "10px 20px",
    background: "#7c3aed",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer"
  },
  loading: {
    color: "yellow"
  },
  error: {
    color: "red"
  },
  success: {
    color: "#22c55e"
  },
  result: {
    background: "#121212",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #222",
    marginTop: 20
  }
};
