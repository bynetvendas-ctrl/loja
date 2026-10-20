# Loja das Ferramentas - Projeto E-commerce (Base Limpa)

Este projeto contém uma base completa de loja virtual de alta conversão para produtos e ferramentas elétricas. O código foi totalmente higienizado, livre de marcas de scraping (HTTrack), livre de pixels de terceiros e com estrutura pronta para ser executada localmente enquanto você define a solução de backend e checkout.

---

## 🚀 Como Iniciar o Projeto Localmente

Você não precisa instalar nenhuma dependência externa pesada. O servidor de desenvolvimento foi construído com os módulos nativos do Node.js:

```bash
# Opção 1: Via npm (no PowerShell use npm.cmd caso script policy esteja restrita)
npm start

# Opção 2: Diretamente com Node.js
node server.js
```

Abra no seu navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ O que foi Higienizado e Preparado

1. **Remoção de Pegadas de Scraping:**
   - Todos os comentários e meta tags inseridos pelo HTTrack foram eliminados de todos os 25 arquivos HTML.
   - Pastas temporárias de telemetria (`signals/` e `cdn-cgi/`) foram excluídas.
   - Imagens duplicadas e caminhos de arquivos quebrados foram normalizados.

2. **Remoção de Rastreamento de Terceiros:**
   - Foram removidos os 3 Facebook Pixels pertencentes à conta do proprietário original.
   - Foram removidos os beacons de analytics da Cloudflare (`cloudflareinsights`).
   - Foi deixado um marcador limpo: `<!-- Meta Pixel: Insira seu script de Pixel aqui -->` nos arquivos HTML para quando você for rodar suas próprias campanhas.

3. **Correção de Links e E-mails:**
   - Links que apontavam para o decodificador do Cloudflare foram substituídos por links diretos `mailto:contato@sualoja.com.br`.

4. **Servidor Local Inteligente (`server.js`):**
   - **Roteamento amigável:** Acessa `/sobre-nos`, `/categoria/ofertas`, `/produto/parafusadeira` sem precisar digitar `.html`.
   - **Busca de CEP em tempo real:** Integrado à API pública do **ViaCEP**; ao preencher o CEP no checkout, o endereço é completado automaticamente.
   - **Mocks de RPC / Server Functions:** Evita erros vermelhos no console do navegador e permite navegar fluidamente por toda a loja.

---

## ⚙️ Configuração dos Dados da Sua Loja

No arquivo **`store.config.json`** na raiz do projeto, você pode alterar os dados principais:

```json
{
  "storeName": "Loja das Ferramentas",
  "legalName": "Sua Empresa LTDA",
  "cnpj": "00.000.000/0001-00",
  "email": "contato@sualoja.com.br",
  "phone": "(11) 99999-9999",
  "whatsapp": "5511999999999",
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01001-000"
  }
}
```

---

## 📦 Estrutura de Arquivos

* `index.html` — Página inicial da loja (vitrine de ofertas e banners).
* `categoria/` — Páginas de categorias (`ferramentas-eletricas.html`, `construcao.html`, etc.).
* `produto/` — Páginas individuais dos 13 produtos do catálogo.
* `assets/products-oVtLdHxE.js` — Banco de dados completo em JavaScript (títulos, descrições, preços, avaliações reais e fotos).
* `site/products/` — Todas as fotos dos produtos e avaliações em alta resolução WebP/PNG.
* `site/banners/` — Banners desktop e mobile da página inicial.
* `server.js` — Servidor HTTP local pronto para execução.
* `store.config.json` — Dados de contato e endereço da loja.

---

## 💳 Próximos Passos (Backend e Checkout)

Quando você decidir o modelo de pagamento que irá utilizar:

* **Opção 1 (Checkout Externo):** Podemos apontar os botões de compra para links de checkout como **Yampi, CartPanda, Appmax, Kiwify ou Vega Checkout**.
* **Opção 2 (Pix Nativo / Backend Integrado):** Podemos conectar o `server.js` diretamente com as credenciais da API do **Mercado Pago**, **Asaas** ou **EFI (Gerencianet)** para gerar o QR Code Pix real no próprio checkout da loja.
