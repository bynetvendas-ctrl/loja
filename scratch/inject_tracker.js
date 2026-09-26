const fs = require('fs');
const path = require('path');

function findHtml(dir) {
  let res = [];
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'COPIAR PIXEL E CHAVE PIX') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) res = res.concat(findHtml(full));
    else if (item.endsWith('.html') && item !== 'admin.html') res.push(full);
  }
  return res;
}

const list = findHtml('.');
let updated = 0;
for (const file of list) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('tracker.js')) {
    content = content.replace('</head>', '  <script src="/assets/tracker.js" defer></script>\n</head>');
    fs.writeFileSync(file, content, 'utf8');
    updated++;
  }
}
console.log('Successfully injected tracker.js into ' + updated + ' HTML files.');
