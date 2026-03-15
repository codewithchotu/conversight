import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = 'AIzaSyDfeORKOiihq-rFNLGZ9-EogfPGMbLMD-s';

async function test() {
    console.log('--- START TEST ---');
    try {
        const client = new GoogleGenAI({ apiKey: API_KEY });
        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('hi');
        console.log('Response type:', typeof result.response);
        if (result.response) {
            console.log('Response keys:', Object.keys(result.response));
            console.log('Text type:', typeof result.response.text);
            console.log('Full Response:', JSON.stringify(result.response, null, 2));
        }
    } catch (e) {
        console.log('TEST ERROR STACK:');
        console.log(e.stack);
    }
    console.log('--- END TEST ---');
}

test();
