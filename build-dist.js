const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('🚀 Iniciando geração do pacote de distribuição (dist)...');

// 1. Limpar / Recriar pasta dist
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Função auxiliar para copiar diretórios recursivamente
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Copiar pastas de assets estáticos
const staticDirs = ['assets', 'images', 'site', 'categoria', 'produto'];
for (const dir of staticDirs) {
  const src = path.join(ROOT_DIR, dir);
  const dest = path.join(DIST_DIR, dir);
  if (fs.existsSync(src)) {
    console.log(`📦 Copiando pasta ${dir}/...`);
    copyDirSync(src, dest);
  }
}

// 3. Copiar páginas HTML da raiz
const rootEntries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
for (const entry of rootEntries) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    console.log(`📄 Copiando página ${entry.name}...`);
    fs.copyFileSync(path.join(ROOT_DIR, entry.name), path.join(DIST_DIR, entry.name));
  }
}

// 4. Copiar favicon e ícones
if (fs.existsSync(path.join(ROOT_DIR, 'favicon.png'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'favicon.png'), path.join(DIST_DIR, 'favicon.png'));
}
if (fs.existsSync(path.join(ROOT_DIR, 'favicon.svg'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'favicon.svg'), path.join(DIST_DIR, 'favicon.svg'));
}

// 5. Copiar arquivos de backend de produção
const backendFiles = ['server.js', 'db.js', 'store.config.json', 'package.json'];
for (const file of backendFiles) {
  const src = path.join(ROOT_DIR, file);
  if (fs.existsSync(src)) {
    console.log(`⚙️ Copiando backend ${file}...`);
    fs.copyFileSync(src, path.join(DIST_DIR, file));
  }
}

// 6. Criar _redirects para Netlify (URLs amigáveis e roteamento de SPA/Páginas)
const redirectsContent = `# Roteamento amigável para páginas da Loja das Ferramentas no Netlify
/sobre-nos             /sobre-nos.html             200
/privacidade           /privacidade.html           200
/termos                /termos.html                200
/politica-de-envio     /politica-de-envio.html     200
/politica-de-reembolso /politica-de-reembolso.html 200
/trocas-e-devolucoes   /trocas-e-devolucoes.html   200
/admin                 /admin.html                 200
/admin/                /admin.html                 200

# Rotas de SPA (Checkout, Pedido Pix e Histórico)
/checkout/*            /index.html                 200
/checkout              /index.html                 200
/pedido/*              /index.html                 200
/pedido                /index.html                 200
/meus-pedidos          /index.html                 200

# Redirecionamento da API e Server Functions para Netlify Functions
/_serverFn/*           /.netlify/functions/api/:splat  200
/api/*                 /.netlify/functions/api/:splat  200
`;
fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirectsContent, 'utf8');
console.log('🔗 Gerado arquivo _redirects para Netlify.');

// 7. Criar netlify.toml
const netlifyTomlContent = `[build]
  publish = "."
  functions = "netlify/functions"

[[redirects]]
  from = "/_serverFn/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/admin"
  to = "/admin.html"
  status = 200

[[redirects]]
  from = "/sobre-nos"
  to = "/sobre-nos.html"
  status = 200

[[redirects]]
  from = "/termos"
  to = "/termos.html"
  status = 200

[[redirects]]
  from = "/privacidade"
  to = "/privacidade.html"
  status = 200

[[redirects]]
  from = "/politica-de-envio"
  to = "/politica-de-envio.html"
  status = 200

[[redirects]]
  from = "/politica-de-reembolso"
  to = "/politica-de-reembolso.html"
  status = 200

[[redirects]]
  from = "/trocas-e-devolucoes"
  to = "/trocas-e-devolucoes.html"
  status = 200

[[redirects]]
  from = "/checkout/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/checkout"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/pedido/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/pedido"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/meus-pedidos"
  to = "/index.html"
  status = 200
`;
fs.writeFileSync(path.join(DIST_DIR, 'netlify.toml'), netlifyTomlContent, 'utf8');
console.log('⚙️ Gerado netlify.toml.');

// 8. Copiar Netlify Serverless Functions para dist
const srcFunctions = path.join(ROOT_DIR, 'netlify');
const destFunctions = path.join(DIST_DIR, 'netlify');
if (fs.existsSync(srcFunctions)) {
  console.log('⚡ Copiando netlify/functions/...');
  copyDirSync(srcFunctions, destFunctions);
}

// 9. Gerar README_DEPLOY.md explicativo dentro de dist
const readmeDeploy = `# Instruções de Deploy - Loja das Ferramentas

Parabéns! Esta pasta \`dist/\` contém o pacote completo da loja virtual pronto para ir para produção.

---

### ⚠️ Importante sobre o "Netlify Drag & Drop" (Upload de Pasta no Navegador)

Ao arrastar uma pasta para o **Netlify Drop** pelo site:
* O Netlify publica apenas arquivos estáticos (HTML, CSS, imagens e JavaScript do navegador).
* O Netlify **NÃO executa servidores Node.js** (\`node server.js\` não roda no Drop) e **NÃO ativa Netlify Functions** via arrastar-e-soltar pelo navegador (o Netlify só processa funções serverless se o deploy for feito via Git ou CLI).
* **O que acontece sem o backend ativo?** A vitrine e o carrinho funcionam normalmente, mas o PIX não será gerado na ProPayBR, o webhook não confirmará o pagamento e o painel admin não conseguirá autenticar.

---

## 🚀 Como Colocar no Ar com 100% das Funcionalidades Ativas

Escolha uma das 3 melhores opções abaixo:

### OPÇÃO 1 (Recomendada no Netlify): Deploy via Netlify CLI (1 comando)
Sem precisar mexer em Git, você pode subir os arquivos estáticos E as funções do Netlify diretamente pelo terminal:
\`\`\`bash
# 1. Instalar/rodar o CLI do Netlify e publicar a pasta dist:
npx netlify deploy --prod --dir=dist
\`\`\`
O Netlify fará o upload dos arquivos e ativará automaticamente a função \`api.js\`!

---

### OPÇÃO 2: Conectar Repositório Git ao Netlify (100% Automático & Grátis)
1. Suba seu projeto para o GitHub ou GitLab.
2. No painel do Netlify, clique em **Add new site > Import an existing project**.
3. Selecione o repositório. O Netlify detectará o arquivo \`netlify.toml\` automaticamente.
4. Clique em **Deploy Site**.
Toda a loja, URLs amigáveis e as funções serverless de PIX e Admin ficarão no ar com HTTPS gratuito.

---

### OPÇÃO 3 (A mais robusta): Hospedar no Render.com ou Railway (Plano Grátis)
Como o projeto já possui um servidor nativo completo (\`server.js\`) sem dependências pesadas:
1. Crie uma conta gratuita em [render.com](https://render.com).
2. Crie um **New Web Service** apontando para o seu projeto.
3. Comando de Inicialização: \`node server.js\` ou \`npm start\`.
4. Porta: \`3000\` (ou deixe o Render atribuir automaticamente via \`process.env.PORT\`).
Pronto! Você terá servidor Node.js dedicado, banco Supabase integrado, geração de PIX e Webhook funcionando em tempo real.
`;
fs.writeFileSync(path.join(DIST_DIR, 'README_DEPLOY.md'), readmeDeploy, 'utf8');
console.log('📋 Gerado README_DEPLOY.md com guia passo a passo.');

console.log('✅ Pacote dist/ criado com sucesso!');

