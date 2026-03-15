const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    console.log('--- Testing /api/upload ---');
    const form = new FormData();
    // Use sales_data.csv if it exists, or create a dummy one
    const testFile = 'test_upload.csv';
    fs.writeFileSync(testFile, 'name,age\nAlice,30\nBob,25');
    
    form.append('file', fs.createReadStream(testFile));

    try {
        const response = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Upload Error:', e.message);
    } finally {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    }
}

testUpload();
