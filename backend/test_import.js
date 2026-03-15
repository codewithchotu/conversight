import { GoogleGenAI } from '@google/generative-ai';
console.log('GoogleGenAI successfully imported');
const genAI = new GoogleGenAI('dummy');
console.log('Instance created');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
console.log('Model object retrieved');
