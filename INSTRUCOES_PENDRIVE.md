# 🚀 Guia de Deploy e Backup — Loja das Ferramentas

Este pacote contém **todos os arquivos necessários** para você subir a loja em qualquer conta Netlify ou guardar como cópia de segurança definitiva em um pendrive.

---

## 📁 O que contém neste pacote?

* **`dist/`** — **PACOTE PRONTO PARA DEPLOY DIRETO (DRAG & DROP):** Pasta pré-compilada pronta para ser arrastada diretamente para o painel da Netlify sem precisar de programação ou GitHub.
* **Arquivos do Código Fonte:** `index.html`, `admin.html`, `server.js`, `db.js`, páginas institucionais, imagens e estilos.
* **`netlify/` & `netlify.toml`** — Configurações das rotas e das funções serverless da API (PIX ProPayBR, Supabase, painel admin).
* **`store.config.json`** — Arquivo central de configurações da loja (nome, CNPJ, WhatsApp, credenciais ProPayBR, credenciais Supabase e senha do admin).
* **`supabase_migration.sql`** — Script SQL completo para criar do zero todas as tabelas no Supabase (`pedidos`, `leads_checkout`, `admin_auth`, etc.), caso queira criar um novo banco de dados.

---

## 🛠️ Como fazer o Deploy em outra conta Netlify

Você tem **duas opções** muito simples:

---

### OPÇÃO 1: Upload Direto no Navegador (Drag & Drop — Sem GitHub)
*Ideal se você não quiser usar o GitHub ou quiser o site no ar em 30 segundos.*

1. Acesse sua conta na **[Netlify](https://app.netlify.com/)**.
2. Vá até a aba **Sites**.
3. No final da página de Sites, você verá a caixa pontilhada com a mensagem:
   > *"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"*.
4. **Arraste e solte apenas a pasta `dist`** dentro dessa área pontilhada no navegador.
5. O Netlify fará o upload e o site estará no ar instantaneamente!
6. Em **Site settings > Domain management**, você pode alterar o nome do subdomínio gratuito (`sua-loja.netlify.app`) ou apontar o seu domínio próprio (.com.br).

---

### OPÇÃO 2: Conectar ao GitHub (Deploy Automático)
*Ideal se você quer versionamento de código e atualizações automáticas sempre que alterar algo.*

1. Crie um novo repositório na sua conta do **GitHub** (ex: `minha-nova-loja`).
2. Copie os arquivos deste pacote para esse novo repositório (exceto a pasta `node_modules` e pastas ocultas de sistema).
3. Faça o commit e envie (`git push`) para o GitHub.
4. Na sua conta da **Netlify**:
   - Clique em **"Add new site"** > **"Import an existing project"**.
   - Escolha **GitHub** e selecione o repositório que você criou.
   - O Netlify detectará automaticamente o arquivo `netlify.toml`:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
     - **Functions directory:** `netlify/functions`
   - Clique em **"Deploy site"**.

---

## ⚙️ Como Personalizar para uma Nova Loja

Todas as configurações da loja ficam em **um único arquivo**: `store.config.json`.

```json
{
  "storeName": "Nome da Sua Loja",
  "legalName": "Razão Social LTDA",
  "cnpj": "00.000.000/0001-00",
  "email": "contato@sualoja.com.br",
  "phone": "(11) 99999-9999",
  "whatsapp": "5511999999999",
  "businessHours": "Segunda a Sexta, das 08h às 18h",
  "propay": {
    "clientId": "SUA_CHAVE_PROPAY_CLIENT_ID",
    "clientSecret": "SUA_CHAVE_PROPAY_CLIENT_SECRET",
    "baseUrl": "https://api.propixbr.com"
  },
  "supabase": {
    "url": "https://seu-projeto.supabase.co",
    "anonKey": "sua-anon-key",
    "serviceRoleKey": "sua-service-role-key",
    "storeId": "identificador_unico_da_loja"
  },
  "adminPassword": "admin"
}
```

* **Para usar o mesmo banco de dados com uma loja diferente:**
  Basta mudar apenas o campo `"storeId"` para outro nome (ex: `"lojadasferramentas_site2"`). Assim, os dados dessa nova loja não se misturam com a anterior, mesmo usando a mesma conta do Supabase!

* **Para criar um banco novo do zero no Supabase:**
  1. Crie um novo projeto no [Supabase](https://supabase.com).
  2. Vá em **SQL Editor** > **New Query**.
  3. Copie todo o conteúdo do arquivo `supabase_migration.sql` e clique em **Run**.
  4. Cole a URL e as Chaves no seu `store.config.json`.

---

## 💻 Como Rodar Localmente no seu Computador (Testes)

Se quiser rodar o site no seu computador sem internet/deploy:
1. Abra o terminal na pasta deste projeto.
2. Execute:
   ```bash
   node server.js
   ```
3. O servidor abrirá em:
   - **Loja:** `http://localhost:3000`
   - **Painel Admin:** `http://localhost:3000/admin`
