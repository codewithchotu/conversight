const { GoogleGenerativeAI } = require('@google/generative-ai');

const KEYS = [
    'AIzaSyDLh0x0vjmuoSViHfmiDkER9UkGBKxLC9s',
    'AIzaSyCVwHzjWUaM-nlU86f67TUhFjBQClNvdP0',
    'AIzaSyAIMgzbSI5kux5we9dV9OC-KtEzB-g9fuQ'
];

async function testKeys() {
    for (let i = 0; i < KEYS.length; i++) {
        console.log(`\n--- Testing Key ${i + 1} ---`);
        try {
            const genAI = new GoogleGenerativeAI(KEYS[i]);
            // Testing with gemini-2.0-flash-exp first since 1.5 might be restricted on some newer accounts
            // or maybe gemini-1.5-flash is missing.
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent('ping');
            console.log(`Key ${i + 1} Response:`, result.response.text());
        } catch (e) {
            console.error(`Key ${i + 1} Error:`, e.status, e.message);
            // Try another model if 404
            if (e.status === 404) {
               console.log('Trying gemini-pro...');
               try {
                   const genAI = new GoogleGenerativeAI(KEYS[i]);
                   const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                   const result = await model.generateContent('ping');
                   console.log(`Key ${i + 1} (gemini-pro) Response:`, result.response.text());
               } catch (e2) {
                   console.error(`Key ${i + 1} (gemini-pro) Error:`, e2.status, e2.message);
               }
            }
        }
    }
}

testKeys();
