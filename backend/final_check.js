import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = 'AIzaSyDfeORKOiihq-rFNLGZ9-EogfPGMbLMD-s';

async function test() {
    try {
        const genAI = new GoogleGenAI(API_KEY);
        // Testing if it's genAI.generativeModel or genAI.getGenerativeModel
        console.log('Testing genAI.generativeModel...');
        const model = genAI.generativeModel({ model: 'gemini-1.5-flash' });
        console.log('Model created successfully');
        
        const result = await model.generateContent('ping');
        console.log('Result type:', typeof result);
        console.log('Result keys:', Object.keys(result));
        
        if (result.response) {
            console.log('Response keys:', Object.keys(result.response));
            console.log('Text:', result.response.text());
        }
    } catch (e) {
        console.log('Final Test Error:', e.message);
        console.log(e.stack);
    }
}
test();
