const https = require('https');

const KEYS = [
    'AIzaSyDLh0x0vjmuoSViHfmiDkER9UkGBKxLC9s',
    'AIzaSyCVwHzjWUaM-nlU86f67TUhFjBQClNvdP0',
    'AIzaSyAIMgzbSI5kux5we9dV9OC-KtEzB-g9fuQ'
];

async function listModels() {
    for (let i = 0; i < KEYS.length; i++) {
        console.log(`\n--- Models for Key ${i + 1} ---`);
        await new Promise((resolve) => {
            https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${KEYS[i]}`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.models) {
                            console.log(json.models.map(m => m.name));
                        } else {
                            console.log('Error:', json);
                        }
                    } catch (e) {
                        console.log('Parse error:', e.message);
                    }
                    resolve();
                });
            }).on('error', (e) => {
                console.error('HTTPS Error:', e.message);
                resolve();
            });
        });
    }
}

listModels();
