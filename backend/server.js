const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const { parse } = require('csv-parse');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

/* ✅ CORS FIX */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://conversight-ppcw.vercel.app",
    "https://conversight-two.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

/* ===== GEMINI ===== */
const API_KEYS = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3
].filter(Boolean);

let currentKeyIndex = 0;
const cache = {};

function getAI() {
  return new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
}

async function callGemini(prompt) {
  const hash = crypto.createHash('md5').update(prompt).digest('hex');
  if (cache[hash]) return cache[hash];

  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const model = getAI().getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      cache[hash] = text;
      return text;
    } catch {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    }
  }
  throw new Error("All Gemini keys failed");
}

/* ===== FILE UPLOAD ===== */
const upload = multer({ dest: "/tmp/" });
const db = new Database(":memory:");

let table = null;
let schema = null;

app.get("/", (req, res) => {
  res.send("Conversight Backend Running 🚀");
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  const parser = fs.createReadStream(req.file.path).pipe(
    parse({ columns: true, skip_empty_lines: true })
  );

  let rows = [];
  let cols = [];

  parser.on("data", (r) => {
    if (!cols.length) cols = Object.keys(r);
    rows.push(r);
  });

  parser.on("end", () => {
    table = "data";
    schema = cols;

    db.exec(`DROP TABLE IF EXISTS data`);
    db.exec(`CREATE TABLE data (${cols.map(c => `"${c}" TEXT`).join(",")})`);

    const stmt = db.prepare(
      `INSERT INTO data (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`
    );

    const insert = db.transaction((rows) => {
      rows.forEach(r => stmt.run(cols.map(c => r[c])));
    });

    insert(rows);
    fs.unlinkSync(req.file.path);

    res.json({ message: "Uploaded", schema });
  });
});

app.post("/api/query", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "No query" });

  try {
    const prompt = `Analyze table with columns ${schema.join(",")} and answer: ${query}`;
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, "0.0.0.0", () =>
  console.log("Server running on", port)
);;
