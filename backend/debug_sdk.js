import { GoogleGenAI } from '@google/genai';
const genAI = new GoogleGenAI('test');
console.log('genAI type:', typeof genAI);
console.log('genAI properties:', Object.keys(genAI));
console.log('getGenerativeModel type:', typeof genAI.getGenerativeModel);
console.log('Full genAI object:', genAI);
