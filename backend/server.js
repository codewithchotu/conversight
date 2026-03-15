const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3');
const { parse } = require('csv-parse');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Users provided keys for Nexus BI
const API_KEYS = [
    'AIzaSyDLh0x0vjmuoSViHfmiDkER9UkGBKxLC9s',
    'AIzaSyCVwHzjWUaM-nlU86f67TUhFjBQClNvdP0',
    'AIzaSyAIMgzbSI5kux5we9dV9OC-KtEzB-g9fuQ',
];

let currentKeyIndex = 0;
const queryCache = {};

function getAI() {
    return new GoogleGenerativeAI(API_KEYS[currentKeyIndex]);
}

async function callGemini(prompt) {
    const cacheKey = crypto.createHash('md5').update(prompt).digest('hex');
    if (queryCache[cacheKey]) {
        console.log('Cache hit - skipping API call');
        return queryCache[cacheKey];
    }

    for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
        try {
            const genAI = getAI();
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(prompt);
            
            if (!result || !result.response) {
                throw new Error('Empty response from model');
            }

            const text = result.response.text();
            
            queryCache[cacheKey] = text;
            return text;
        } catch (error) {
            console.error(`Gemini Error (Key ${currentKeyIndex + 1}):`, error.message);
            const isQuotaError = error.message?.includes('429') ||
                                 error.message?.toLowerCase().includes('quota') ||
                                 error.message?.toLowerCase().includes('rate limit');
            
            if (isQuotaError && attempt < API_KEYS.length - 1) {
                console.warn(`Key ${currentKeyIndex + 1} quota hit, switching to next key...`);
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
            } else {
                throw error;
            }
        }
    }

    throw new Error('All API keys exhausted or permanent error occurred');
}

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory SQLite Database
const db = new sqlite3.Database(':memory:');

let currentTableName = null;
let currentSchema = null;

// Function to generate a safe table name from a filename
const generateTableName = (filename) => {
    return filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    currentTableName = generateTableName(originalName);

    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true }));
    
    let isFirstRow = true;
    let rowsToInsert = [];
    let columns = [];

    parser.on('data', (row) => {
        if (isFirstRow) {
            columns = Object.keys(row);
            currentSchema = columns;
            isFirstRow = false;
        }
        rowsToInsert.push(row);
    });

    parser.on('end', () => {
        if (rowsToInsert.length === 0) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'CSV file is empty' });
        }

        db.serialize(() => {
            db.run(`DROP TABLE IF EXISTS ${currentTableName}`);
            
            const createTableSQL = `CREATE TABLE ${currentTableName} (
                ${columns.map(col => `"${col}" TEXT`).join(', ')}
            )`;
            
            db.run(createTableSQL, (err) => {
                if (err) {
                    console.error("Error creating table:", err);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    return res.status(500).json({ error: 'Failed to create table' });
                }

                const placeholders = columns.map(() => '?').join(', ');
                const insertSQL = `INSERT INTO ${currentTableName} (${columns.map(col => `"${col}"`).join(', ')}) VALUES (${placeholders})`;
                
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    const stmt = db.prepare(insertSQL);
                    
                    rowsToInsert.forEach((row) => {
                        const values = columns.map(col => row[col]);
                        stmt.run(values, (err) => {
                            if (err) console.error("Row insert error:", err);
                        });
                    });
                    
                    stmt.finalize();
                    db.run('COMMIT', (err) => {
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        if (err) {
                            console.error("Error committing transaction:", err);
                            return res.status(500).json({ error: 'Failed to insert data' });
                        }
                        console.log(`Successfully loaded ${rowsToInsert.length} rows into ${currentTableName}`);
                        res.json({ message: 'File uploaded and database initialized successfully', tableName: currentTableName, schema: currentSchema });
                    });
                });
            });
        });
    });
    
    parser.on('error', (err) => {
         console.error("CSV Parse Error:", err);
         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
         res.status(500).json({ error: 'Failed to parse CSV' });
    });
});

app.get('/api/filters', (req, res) => {
    if (!currentTableName || !currentSchema) {
        return res.status(400).json({ error: 'No dataset uploaded' });
    }

    console.log(`Extracting filters for table: ${currentTableName}`);
    const categoricalColumns = [];
    const filterData = {};

    const promises = currentSchema.map(col => {
        return new Promise((resolve) => {
            db.all(`SELECT DISTINCT "${col}" FROM ${currentTableName} WHERE "${col}" IS NOT NULL LIMIT 100`, [], (err, rows) => {
                if (err) {
                    console.error(`Error fetching unique values for ${col}:`, err);
                } else if (rows.length > 0 && rows.length <= 60) { // Increased limit to 60 unique values
                    console.log(`Detected categorical column: ${col} (${rows.length} values)`);
                    categoricalColumns.push(col);
                    filterData[col] = rows.map(r => r[col]);
                }
                resolve();
            });
        });
    });

    Promise.all(promises).then(() => {
        console.log(`Filter extraction complete. Found ${categoricalColumns.length} columns.`);
        res.json({ columns: categoricalColumns, values: filterData });
    });
});

app.post('/api/query', async (req, res) => {
    const { query, activeFilters } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    if (!currentTableName || !currentSchema) {
        return res.status(400).json({ error: 'No dataset uploaded yet' });
    }

    try {
        const filterContext = activeFilters && Object.keys(activeFilters).length > 0
            ? `\nCURRENT ACTIVE FILTERS: ${JSON.stringify(activeFilters)}. ONLY analyze data satisfying these conditions.`
            : '';

        const prompt = `
You are a data analyst assistant for the "Nexus BI" platform.
I have a SQLite table named "${currentTableName}" with the following columns: ${currentSchema.join(', ')}.${filterContext}

The user asked: "${query}"

Your goal is to provide a comprehensive analysis. If the user asks for multiple things (e.g., "bar chart and pie chart" or "trend and breakdown"), you should generate multiple distinct analysis components.

For each component:
1. Generate a valid SQLite query.
2. Suggest the best chart type: "bar", "line", "pie", "scatter", "number".
3. Identify xAxis and yAxis columns.

Return ONLY a valid JSON array of objects. Each object must have this structure:
{
  "sql": "SELECT ...",
  "chartType": "bar",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "thoughts": "Brief explanation of this specific component"
}

Provide NO markdown formatting, NO backticks, and NO explanatory text outside the JSON.
`;

        const responseText = await callGemini(prompt);
        console.log('Gemini raw response:', responseText);
        const cleanedResponse = responseText.trim().replace(/^```json/g, '').replace(/```$/g, '');
        
        let geminiResults;
        try {
            const parsed = JSON.parse(cleanedResponse);
            geminiResults = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            console.error("Failed to parse Gemini response:", cleanedResponse);
            return res.status(500).json({ error: 'Failed to generate a valid data structure', details: cleanedResponse });
        }

        const finalResults = [];

        for (const result of geminiResults) {
            const { sql, chartType, xAxis, yAxis, thoughts } = result;
            
            await new Promise((resolve) => {
                db.all(sql, [], (err, rows) => {
                    if (err) {
                        console.error("SQL Execution Error:", err, "Query:", sql);
                        finalResults.push({
                            error: `SQL Error: ${err.message}`,
                            sql: sql
                        });
                    } else {
                        finalResults.push({
                            data: rows,
                            chartConfig: { type: chartType, xAxis, yAxis },
                            sql: sql,
                            thoughts: thoughts
                        });
                    }
                    resolve();
                });
            });
        }

        res.json({ results: finalResults });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to process natural language query', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
