const apiKey = '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';

async function checkModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await res.json();
  const freeModels = data.data.filter(m => m.id.includes(':free') || m.pricing.prompt === '0');
  console.log("FREE OR LOW COST MODELS ON OPENROUTER:");
  console.log(freeModels.slice(0, 15).map(m => m.id));
}

checkModels().catch(console.error);
