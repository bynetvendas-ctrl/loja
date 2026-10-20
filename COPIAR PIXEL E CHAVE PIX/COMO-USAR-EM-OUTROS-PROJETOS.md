# 📦 Painel Administrativo Universal — Guia de Uso em Outros Projetos

Esta pasta contém uma cópia completa, independente e pronta para uso do **Painel Administrativo E-commerce**. Você pode usá-lo em qualquer outro site ou novo projeto que ainda não tenha painel de controle.

---

## 📁 Estrutura da Pasta

```text
painel-admin/
├── admin/                         # Frontend completo do painel (HTML, CSS, JS, gráficos e globo 3D)
│   ├── index.html                 # Página principal do painel administrativo
│   ├── admin.css                  # Estilos responsivos em modo dark
│   ├── admin.js                   # Lógica com gráficos, globo 3D, pedidos e integrações
│   ├── vendor-chart.js            # Biblioteca de gráficos (Chart.js)
│   ├── vendor-globe.js            # Biblioteca do globo 3D
│   ├── earth-night.jpg            # Textura do planeta Terra
│   └── earth-topology.png         # Textura de relevo
│
├── functions/                     # Funções Serverless (Netlify Functions)
│   ├── admin-login.js             # Autenticação e validação de senha
│   ├── admin-summary.js           # Faturamento, conversão, funil e campanhas (com auto-sync ProPix)
│   ├── admin-orders.js            # Lista de pedidos, status e reconciliação automática
│   ├── admin-order-update.js      # Código de rastreio e marcar como enviado
│   ├── admin-live.js              # Visitantes online, cidades e eventos ao vivo
│   ├── admin-settings.js          # Salva Pixel da Meta, token CAPI e gateway
│   ├── admin-pixel-test.js        # Testador de Pixel e API de Conversões
│   ├── site-settings.js           # Fornece o Pixel ID para as páginas da loja
│   ├── track.js                   # Rastreio de visitas, sessões e funil
│   └── webhook-propix.js          # Webhook para confirmação instantânea de Pix
│
├── client-tracker/
│   └── track.js                   # Script leve para incluir no index.html da sua loja
│
├── netlify.toml                   # Configuração se você for rodar o painel como um site separado
├── snippet-netlify.toml           # Linhas prontas para colar no netlify.toml de outros sites
├── package.json                   # Dependência do banco de dados Netlify Blobs (@netlify/blobs)
└── COMO-USAR-EM-OUTROS-PROJETOS.md # Este manual
```

---

## 🚀 Método 1: Adicionar o Painel dentro de outro Site existente (Recomendado)

Se você já tem um site no Netlify e quer que o painel abra em `seusite.com/admin`:

### Passo 1: Copiar a pasta `admin/`
Copie a pasta `admin/` para dentro da raiz do seu outro projeto:
```text
seu-outro-projeto/
├── admin/                 <-- cole aqui a pasta inteira
├── index.html
└── ...
```

### Passo 2: Copiar as Funções Serverless
Copie todos os arquivos da pasta `functions/` para dentro da pasta `netlify/functions/` do seu outro projeto:
```text
seu-outro-projeto/
├── netlify/
│   └── functions/         <-- cole aqui os arquivos .js de functions/
```

### Passo 3: Configurar os Redirecionamentos no `netlify.toml`
Abra o arquivo `netlify.toml` do seu outro projeto e cole no final o conteúdo do arquivo [`snippet-netlify.toml`](snippet-netlify.toml).

### Passo 4: Adicionar a dependência `@netlify/blobs`
No `package.json` do seu outro projeto, certifique-se de que a dependência `@netlify/blobs` está presente:
```json
"dependencies": {
  "@netlify/blobs": "^11.1.0"
}
```

### Passo 5: Rastrear visitas no seu novo site
Copie o arquivo [`client-tracker/track.js`](client-tracker/track.js) para a raiz do seu outro site e inclua antes do `</body>` no seu `index.html`:
```html
<script src="track.js"></script>
```
*Pronto! O painel já passará a monitorar visitantes ao vivo, cidades e capturar as UTMs de campanha automaticamente.*

---

## 🌐 Método 2: Subir o Painel como um Site Separado no Netlify

Se preferir ter um site exclusivo só para o painel (ex.: `admin-meusite.netlify.app` ou `admin.meudominio.com`):

1. Crie um novo repositório ou faça deploy direto desta pasta `painel-admin` no Netlify.
2. O arquivo [`netlify.toml`](netlify.toml) incluído já está 100% configurado para publicar o painel diretamente na página inicial (`/`).
3. Nas lojas/checkouts dos seus outros sites, configure as chamadas de API (como rastreio e checkout) apontando para a URL do seu painel: `https://admin-meusite.netlify.app/api/...`

---

## 🔑 Como Personalizar

### 1. Trocar a senha do Painel
Abra o arquivo `functions/admin-login.js` e altere a lista de senhas autorizadas:
```javascript
const validPasswords = ["2209", "sua_nova_senha_aqui"];
```

### 2. Configurar o Gateway ProPix
No Netlify do projeto, cadastre em **Site Configuration → Environment Variables**:
* `PROPIX_CLIENT_ID`: seu client ID da ProPix
* `PROPIX_CLIENT_SECRET`: seu secret da ProPix

*(Se preferir, você também pode colar as chaves diretamente no topo dos arquivos `admin-orders.js`, `admin-summary.js` e `checkout-pix.js`).*

### 3. Ativar o Webhook da ProPix (Recuperação de 100% das vendas)
No painel da ProPix (app.propixbr.com), cadastre a URL de Webhook:
```text
https://seusite.netlify.app/api/webhook/propix
```
Assim que qualquer cliente pagar no app do banco, mesmo fechando a página no celular, o pedido é confirmado como **Pago** na mesma hora no seu painel.

### 4. Nome da Marca e Logotipo
* No arquivo `admin/index.html`, você pode alterar os textos onde diz `YCZ` para o nome da sua nova marca ou loja.
* No arquivo `admin/admin.js`, você pode alterar os nomes dos kits no topo (`KIT_NAMES`).
