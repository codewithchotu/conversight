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

app.use(cors());
app.use(express.json());

/* ================= GEMINI KEYS FROM ENV ================= */
const API_KEYS = [
    process.env.AIzaSyBY - dVN0h_LYuwJTJyNKA2A46NeJB6Ra5s,
    process.env.AIzaSyDDgJCpsJjaKugPLAgTjFpSAht43Rt2eOw,
    process.env.AIzaSyCZpbcSib4ObFgI2d7uga9H3CpCXl8lbMo
].filter(Boolean);

let currentKeyIndex = 0;
const queryCache = {};

function getAI() {
    return new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
}

async function callGemini(prompt) {
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    if (queryCache[cacheKey]) return queryCache[cacheKey];

    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
        try {
            const genAI = getAI();
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            queryCache[cacheKey] = text;
            return text;
        } catch (error) {
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        }
    }

    throw new Error('All Gemini keys failed');
}

/* ================= MULTER FIX FOR RENDER ================= */
const upload = multer({ dest: '/tmp/' });

/* ================= SQLITE ================= */
const db = new Database(':memory:');

let currentTableName = null;
let currentSchema = null;

const generateTableName = (filename) => {
    return filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

/* ================= UPLOAD API ================= */
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    currentTableName = generateTableName(originalName);

    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true }));

    let rows = [];
    let columns = [];

    parser.on('data', (row) => {
        if (columns.length === 0) columns = Object.keys(row);
        rows.push(row);
    });

    parser.on('end', () => {
        if (rows.length === 0) return res.status(400).json({ error: 'Empty CSV' });

        const createSQL = `CREATE TABLE ${currentTableName} (${columns.map(c => `"${c}" TEXT`).join(', ')})`;

        db.exec(`DROP TABLE IF EXISTS ${currentTableName}`);
        db.exec(createSQL);

        const insert = db.prepare(
            `INSERT INTO ${currentTableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`
        );

        const insertMany = db.transaction((rows) => {
            for (const r of rows) insert.run(columns.map(c => r[c]));
        });

        insertMany(rows);

        fs.unlinkSync(filePath);
        currentSchema = columns;

        res.json({ message: 'CSV loaded', table: currentTableName });
    });
});

/* ================= FILTER API ================= */
app.get('/api/filters', (req, res) => {
    if (!currentTableName) return res.status(400).json({ error: 'No dataset' });
    res.json({ schema: currentSchema });
});

/* ================= QUERY API ================= */
app.post('/api/query', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        const prompt = `Analyze SQLite table ${currentTableName} with columns ${currentSchema.join(', ')}. User query: ${query}`;
        const aiResponse = await callGemini(prompt);
        res.json({ result: aiResponse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});