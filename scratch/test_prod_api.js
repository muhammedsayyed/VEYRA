async function test(url) {
  try {
    console.log('Testing URL:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Give me a high protein breakfast under 500 calories.' }]
      })
    });
    console.log('Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response Text:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
async function run() {
  await test('https://veyra-theta-five.vercel.app/api/ai/chat');
  await test('https://veyra-wellness-ai.vercel.app/api/ai/chat');
}
run();
