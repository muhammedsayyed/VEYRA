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
          if (!full.includes('node_modules') && !full.includes('.git')) {
            searchDir(full);
          }
        } else if (stat.isFile() && stat.size < 1000000) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('sk-or-v1-')) {
            console.log('Found in:', full);
            const match = content.match(/sk-or-v1-[a-zA-Z0-9_-]+/);
            if (match) {
              console.log('Match found! Length:', match[0].length);
              fs.writeFileSync('c:/Users/muhammed/Downloads/VEYRA/scratch/found_key.txt', match[0]);
            }
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

searchDir('C:/Users/muhammed/.gemini/antigravity-ide/mcp');
searchDir('C:/Users/muhammed/.gemini/config');
searchDir('C:/Users/muhammed/Downloads');
