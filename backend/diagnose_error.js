import fetch from 'node-fetch';

async function diagnose() {
  try {
    const response = await fetch('http://localhost:3001/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "test" })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
}

diagnose();
