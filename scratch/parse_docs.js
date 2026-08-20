const fs = require('fs');

const postman = JSON.parse(fs.readFileSync('scratch/postman.json', 'utf8'));

console.log('=== POSTMAN COLLECTION DETAILS ===');

function dumpStructure(obj, depth = 0) {
  const indent = ' '.repeat(depth * 2);
  if (Array.isArray(obj)) {
    obj.forEach(item => dumpStructure(item, depth));
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.name && obj.item) {
      console.log(`${indent}📁 Folder: ${obj.name}`);
      dumpStructure(obj.item, depth + 1);
    } else if (obj.name && obj.request) {
      const req = obj.request;
      let urlStr = '';
      if (typeof req.url === 'string') {
        urlStr = req.url;
      } else if (req.url && req.url.raw) {
        urlStr = req.url.raw;
      }
      console.log(`${indent}📌 Request: ${obj.name}`);
      console.log(`${indent}   Method: ${req.method}`);
      console.log(`${indent}   URL: ${urlStr}`);
      if (req.header && req.header.length) {
        console.log(`${indent}   Headers:`, req.header.map(h => `${h.key}: ${h.value}`).join(', '));
      }
      if (req.url && req.url.query) {
        console.log(`${indent}   Query:`, req.url.query.map(q => `${q.key}=${q.value}`).join(', '));
      }
      if (obj.response && obj.response.length) {
        console.log(`${indent}   Response Sample:`);
        const sample = obj.response[0];
        if (sample.body) {
          try {
            const parsed = JSON.parse(sample.body);
            console.log(indent + '   ' + JSON.stringify(parsed, null, 2).split('\n').slice(0, 25).join('\n' + indent + '   '));
          } catch(e) {
            console.log(`${indent}   ${sample.body.substring(0, 200)}`);
          }
        }
      }
    } else {
      for (const key of Object.keys(obj)) {
        if (key === 'item') dumpStructure(obj[key], depth + 1);
      }
    }
  }
}

dumpStructure(postman);
