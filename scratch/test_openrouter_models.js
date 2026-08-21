async function testModel(model) {
  console.log('Testing model:', model);
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Say hello in 3 words' }]
      })
    });
    console.log('Model:', model, 'Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data).slice(0, 200));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

async function run() {
  await testModel('openai/gpt-oss-20b:free');
  await testModel('google/gemini-2.0-flash-lite-preview-02-05:free');
  await testModel('meta-llama/llama-3.3-70b-instruct:free');
  await testModel('deepseek/deepseek-r1:free');
  await testModel('qwen/qwen-2.5-coder-32b-instruct:free');
}
run();
