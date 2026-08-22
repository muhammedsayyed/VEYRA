const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          searchDir(full);
        } else if (stat.isFile() && stat.size < 50000000) {
          const content = fs.readFileSync(full, 'utf8');
          const match = content.match(/sk-or-v1-[a-zA-Z0-9_-]{30,}/);
          if (match) {
            console.log('FOUND OPENROUTER KEY IN:', full);
            console.log('KEY:', match[0]);
            fs.writeFileSync('c:/Users/muhammed/Downloads/VEYRA/scratch/found_key.txt', match[0]);
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log("Searching brain logs for OpenRouter API Key...");
searchDir('C:/Users/muhammed/.gemini/antigravity-ide/brain');
