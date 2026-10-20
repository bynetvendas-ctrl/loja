# 📦 Painel Admin Completo (Netlify Blobs) — Como Aplicar em Outros Sites

Esta pasta contém **exclusivamente o Painel Administrativo completo** (com Globo 3D ao vivo, Captura de Leads em Tempo Real, Gestão de Pedidos Pix/Cartão, ProPix, Pushin Pay e Meta Pixel + CAPI) já integrado para **ler e gravar diretamente na própria Netlify (`@netlify/blobs`)**, sem precisar do Supabase.

---

## 📁 O que tem nesta pasta

```text
PAINEL-ADMIN-PARA-OUTROS-SITES/
├── admin.html                      # Página completa do Painel Admin (acessível em /admin)
├── db.js                           # Banco de dados nativo da Netlify (@netlify/blobs)
├── store.config.json               # Configurações base (troque o "storeId" para o nome de cada loja)
├── package.json                    # Contém a dependência "@netlify/blobs": "^11.1.0"
├── netlify.toml                    # Configuração pronta da Netlify
├── snippet-netlify.toml            # Trecho de redirecionamentos caso seu outro site já tenha netlify.toml
├── assets/
│   ├── vendor-globe.js             # Motor do Globo 3D de visitantes ao vivo
│   ├── earth-night.jpg             # Textura do Globo 3D
│   ├── earth-topology.png          # Relevo do Globo 3D
│   └── tracker.js                  # Script leve para rastrear visitantes ao vivo nas páginas da loja
└── netlify/
    └── functions/
        ├── api.js                  # API Serverless completa (Login, Leads, Pedidos, Pix, Webhooks, Pixel)
        ├── db.js                   # Cópia do módulo de banco de dados na Netlify
        └── store.config.json       # Cópia da configuração base
```

---

## 🚀 Passo a Passo para Colocar em Qualquer Outro Site Seu

### 1. Copie os arquivos para a raiz do seu outro site
Copie o conteúdo desta pasta para dentro da pasta principal do seu outro site:
- `admin.html` (na raiz do site)
- `db.js` e `store.config.json` (na raiz do site)
- Os 4 arquivos da pasta `assets/` (`vendor-globe.js`, `earth-night.jpg`, `earth-topology.png`, `tracker.js`) para dentro da pasta `assets/` do seu outro site
- A pasta `netlify/` inteira (`netlify/functions/api.js`, `db.js`, `store.config.json`)

### 2. Adicione a dependência `@netlify/blobs` no `package.json`
No `package.json` do seu outro site, garanta que exista a dependência:
```json
"dependencies": {
  "@netlify/blobs": "^11.1.0"
}
```

### 3. Configure as rotas no `netlify.toml`
Se o seu outro site ainda não tiver um `netlify.toml`, basta usar o `netlify.toml` desta pasta.
Se já tiver um `netlify.toml`, abra o arquivo [`snippet-netlify.toml`](snippet-netlify.toml) e cole as regras de redirecionamento nele.

### 4. (Opcional) Ative o Globo 3D de Visitantes nas páginas da loja
Para que o Globo 3D mostre os visitantes navegando ao vivo pelo seu outro site, adicione antes do `</body>` no `index.html` da loja:
```html
<script src="/assets/tracker.js" defer></script>
```

---

## 🔑 Como Configurar as Chaves na Netlify (Key Aberta e Key Secreta)

Depois de publicar na Netlify, você pode configurar suas chaves de **duas maneiras**:

1. **Direto pelo Painel Admin (`seusite.com/admin`)**:
   - Acesse `seusite.com/admin` (senha inicial padrão: `admin`).
   - Vá em **Configurações**, cole a **Key Aberta (Client ID)** e a **Key Secreta (Client Secret)** (ou o Token Pushin Pay / Meta Pixel) e clique em **Salvar**.
   - Os dados ficam gravados de forma permanente no banco da própria Netlify (**Netlify Blobs**).

2. **Pelas Variáveis de Ambiente da Netlify (`Site configuration → Environment variables`)**:
   - `KEY_ABERTA` (ou `PROPIX_CLIENT_ID`): sua chave pública / Client ID
   - `KEY_SECRETA` (ou `PROPIX_CLIENT_SECRET`): sua chave secreta / Client Secret
   - `META_PIXEL_ID` e `META_CAPI_TOKEN` (opcionais)
   - `ADMIN_PASSWORD` (opcional, para definir a senha do painel via variável)

