const fs = require('fs');
const path = require('path');

const excludeDirs = ['node_modules', '.git', 'AppData', 'AppData\\Local\\Temp', 'bin', 'obj', '.cargo', '.rustup', '.vscode'];

function searchDir(dir, depth = 0) {
  if (depth > 6) return;
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (excludeDirs.some(ex => f.includes(ex))) continue;
      const full = path.join(dir, f);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          searchDir(full, depth + 1);
        } else if (stat.isFile() && stat.size < 500000) {
          const content = fs.readFileSync(full, 'utf8');
          const matches = content.match(/sk-or-v1-[a-zA-Z0-9_-]{10,}/g);
          if (matches) {
            for (const m of matches) {
              if (!m.includes('your-cloud-api-key')) {
                console.log('Real OpenRouter key found in:', full);
                fs.writeFileSync('c:/Users/muhammed/Downloads/VEYRA/scratch/real_key.txt', m);
                return;
              }
            }
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

searchDir('C:/Users/muhammed/Downloads');
searchDir('C:/Users/muhammed/Desktop');
searchDir('C:/Users/muhammed/Documents');
searchDir('C:/Users/muhammed/.gemini');
