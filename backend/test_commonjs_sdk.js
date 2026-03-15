const { GoogleGenAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = 'AIzaSyDfeORKOiihq-rFNLGZ9-EogfPGMbLMD-s';

async function test() {
    try {
        const genAI = new GoogleGenAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('ping');
        console.log('Result keys:', Object.keys(result));
        console.log('Response keys:', Object.keys(result.response));
        console.log('Text:', result.response.text());
    } catch (e) {
        console.error('Test Error:', e.message);
    }
}
test();
