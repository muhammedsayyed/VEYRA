const { execSync } = require('child_process');

function addEnv(name, value) {
  console.log(`Adding ${name}...`);
  try {
    execSync(`npx vercel env add ${name} production`, {
      input: value,
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    console.log(`Successfully added ${name}`);
  } catch (e) {
    console.error(`Failed to add ${name}:`, e.message);
  }
}

addEnv('VEYRA_AI_PROVIDER', 'cloud');
addEnv('VEYRA_AI_CLOUD_BASE_URL', 'https://openrouter.ai/api/v1');
addEnv('VEYRA_AI_CLOUD_MODEL', 'openai/gpt-oss-20b:free');
