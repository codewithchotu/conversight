import * as GoogleAI from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

console.log('--- SDK Inspection ---');
console.log('Exports:', Object.keys(GoogleAI));

const { GoogleGenAI } = GoogleAI;
console.log('GoogleGenAI type:', typeof GoogleGenAI);

if (typeof GoogleGenAI === 'function') {
    try {
        const instance = new GoogleGenAI('test-key');
        console.log('Instance type:', typeof instance);
        console.log('Instance keys:', Object.keys(instance));
        console.log('Instance prototype keys:', Object.keys(Object.getPrototypeOf(instance)));
    } catch (e) {
        console.log('Constructor failed:', e.message);
    }
}
