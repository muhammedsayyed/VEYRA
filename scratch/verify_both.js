async function test(url) {
  console.log('\n========================================');
  console.log('Testing Endpoint:', url);
  console.log('========================================');
  const startTime = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Give me a high protein breakfast under 500 calories.' }],
        userContext: {
          user: { firstName: 'MobileUser', goal: 'Weight Loss' },
          nutrition: { dailyCalories: 2000, caloriesRemaining: 500, dailyProtein: 150, proteinRemaining: 40 }
        }
      })
    });
    const roundtripMs = Date.now() - startTime;
    console.log('HTTP Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response Provider:', data.provider);
    console.log('Server Latency:', data.latencyMs, 'ms');
    console.log('Total Roundtrip Latency:', roundtripMs, 'ms');
    console.log('Returned Text Snippet:', (data.message || data.text || data.error)?.slice(0, 180));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

async function run() {
  await test('https://veyra-theta-five.vercel.app/api/ai/chat');
}
run();
