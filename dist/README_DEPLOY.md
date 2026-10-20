# Instruções de Deploy - Loja das Ferramentas

Parabéns! Esta pasta `dist/` contém o pacote completo da loja virtual pronto para ir para produção.

---

### ⚠️ Importante sobre o "Netlify Drag & Drop" (Upload de Pasta no Navegador)

Ao arrastar uma pasta para o **Netlify Drop** pelo site:
* O Netlify publica apenas arquivos estáticos (HTML, CSS, imagens e JavaScript do navegador).
* O Netlify **NÃO executa servidores Node.js** (`node server.js` não roda no Drop) e **NÃO ativa Netlify Functions** via arrastar-e-soltar pelo navegador (o Netlify só processa funções serverless se o deploy for feito via Git ou CLI).
* **O que acontece sem o backend ativo?** A vitrine e o carrinho funcionam normalmente, mas o PIX não será gerado na ProPayBR, o webhook não confirmará o pagamento e o painel admin não conseguirá autenticar.

---

## 🚀 Como Colocar no Ar com 100% das Funcionalidades Ativas

Escolha uma das 3 melhores opções abaixo:

### OPÇÃO 1 (Recomendada no Netlify): Deploy via Netlify CLI (1 comando)
Sem precisar mexer em Git, você pode subir os arquivos estáticos E as funções do Netlify diretamente pelo terminal:
```bash
# 1. Instalar/rodar o CLI do Netlify e publicar a pasta dist:
npx netlify deploy --prod --dir=dist
```
O Netlify fará o upload dos arquivos e ativará automaticamente a função `api.js`!

---

### OPÇÃO 2: Conectar Repositório Git ao Netlify (100% Automático & Grátis)
1. Suba seu projeto para o GitHub ou GitLab.
2. No painel do Netlify, clique em **Add new site > Import an existing project**.
3. Selecione o repositório. O Netlify detectará o arquivo `netlify.toml` automaticamente.
4. Clique em **Deploy Site**.
Toda a loja, URLs amigáveis e as funções serverless de PIX e Admin ficarão no ar com HTTPS gratuito.

---

### OPÇÃO 3 (A mais robusta): Hospedar no Render.com ou Railway (Plano Grátis)
Como o projeto já possui um servidor nativo completo (`server.js`) sem dependências pesadas:
1. Crie uma conta gratuita em [render.com](https://render.com).
2. Crie um **New Web Service** apontando para o seu projeto.
3. Comando de Inicialização: `node server.js` ou `npm start`.
4. Porta: `3000` (ou deixe o Render atribuir automaticamente via `process.env.PORT`).
Pronto! Você terá servidor Node.js dedicado, banco Supabase integrado, geração de PIX e Webhook funcionando em tempo real.
