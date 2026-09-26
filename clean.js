const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'signals' && file !== 'cdn-cgi' && file !== 'node_modules') {
        results = results.concat(getHtmlFiles(fullPath));
      }
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getHtmlFiles(rootDir);
console.log('Encontrados ' + htmlFiles.length + ' arquivos HTML.');
let cleanedCount = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Remover comentarios HTTrack
  content = content.replace(/<!--\s*Mirrored from .*? by HTTrack Website Copier.*?-->\s*/gi, '');
  content = content.replace(/<!--\s*Added by HTTrack\s*--><meta http-equiv="content-type" content="text\/html;charset=utf-8" \/><!--\s*\/Added by HTTrack\s*-->\s*/gi, '');
  content = content.replace(/<!--\s*Created by HTTrack Website Copier.*?-->\s*/gi, '');

  // 2. Remover Facebook Pixel do dono original
  content = content.replace(/<script id="ldf-facebook-pixel">[\s\S]*?<\/script>/gi, '<!-- Meta Pixel: Insira seu script de Pixel aqui -->');

  // 3. Remover Cloudflare Insights / Beacon
  content = content.replace(/<script type="module" src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js\/[^"]*?"[^>]*?>\s*<\/script>/gi, '');

  // 4. Remover Cloudflare Email Decode script
  content = content.replace(/<script data-cfasync="false" src="cdn-cgi\/scripts\/[^"]*?"><\/script>/gi, '');

  // 5. Corrigir links de email do Cloudflare
  content = content.replace(/<a href="cdn-cgi\/l\/email-protection\.html[^"]*"[^>]*>[\s\S]*?<\/a>/gi, (match) => {
    if (match.includes('<svg')) {
      const svgMatch = match.match(/<svg[\s\S]*?<\/svg>/);
      const svg = svgMatch ? svgMatch[0] : '';
      return `<a href="mailto:compras@lojadasferramentas.com" class="inline-flex items-center gap-2 transition-colors hover:text-white">${svg}<span>compras@lojadasferramentas.com</span></a>`;
    }
    return '<a href="mailto:compras@lojadasferramentas.com" class="hover:underline">compras@lojadasferramentas.com</a>';
  });
  content = content.replace(/href="cdn-cgi\/l\/email-protection\.html[^"]*"/gi, 'href="mailto:compras@lojadasferramentas.com"');
  content = content.replace(/<span class="__cf_email__"[^>]*>.*?<\/span>/gi, '<span>compras@lojadasferramentas.com</span>');

  // 6. Substituir wide-logo7eb7.png por wide-logo-original.png
  content = content.replace(/wide-logo7eb7\.png(?:\?v=\d+)?/gi, 'wide-logo-original.png');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    cleanedCount++;
  }
}

console.log('Total de arquivos HTML limpos:', cleanedCount);

// Remover pastas lixo do scraper: signals e cdn-cgi
function removeDirRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log('Pasta removida com sucesso:', dirPath);
  }
}

removeDirRecursive(path.join(rootDir, 'signals'));
removeDirRecursive(path.join(rootDir, 'cdn-cgi'));

// Remover wide-logo7eb7.png duplicado
const duplicateLogo = path.join(rootDir, 'site', 'brand', 'wide-logo7eb7.png');
if (fs.existsSync(duplicateLogo)) {
  fs.unlinkSync(duplicateLogo);
  console.log('Logo duplicada wide-logo7eb7.png removida com sucesso.');
}
