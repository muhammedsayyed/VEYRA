async function test() {
  const url = 'https://veyra-wellness-ai.vercel.app/api/ai/chat';
  try {
    console.log('Testing LIVE Production URL:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Give me a high protein breakfast under 500 calories.' }]
      })
    });
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response JSON:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
test();
