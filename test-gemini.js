
const fetch = require('node-fetch');

async function testGemini() {
  const payload = {
    model: "gemini-2.0-flash-exp",
    contents: [{ role: "user", parts: [{ text: "Return a JSON object with a 'test' field: { \"test\": \"success\" }" }] }],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Note: This needs the dev server running. 
// Since I can't guarantee that, I'll check the code for potential issues instead.
// testGemini();
