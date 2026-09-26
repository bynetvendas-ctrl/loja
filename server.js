/**
 * Servidor de Desenvolvimento Local & Painel Admin - Loja das Ferramentas
 * Execução: node server.js ou npm start
 * Porta padrão: 3000
 *
 * Pagamentos: ProPayBR (PIX real)
 * Banco de Dados: Supabase (PostgreSQL)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const crypto = require('crypto');
const db = require('./db.js');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ROOT_DIR = process.cwd();

// ─── Config helpers ───────────────────────────────────────────────────────────
function getStoreConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'store.config.json'), 'utf8'));
  } catch {
    return {};
  }
}

function saveStoreConfig(cfg) {
  try {
    fs.writeFileSync(path.join(ROOT_DIR, 'store.config.json'), JSON.stringify(cfg, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Config] Erro ao salvar store.config.json:', err);
    return false;
  }
}

function getProPayConfig() {
  return getStoreConfig().propay || {};
}

function getSupabaseConfig() {
  return getStoreConfig().supabase || {};
}

async function getAdminPassword() {
  return await db.getAdminPassword();
}

async function setAdminPassword(newPassword) {
  return await db.setAdminPassword(newPassword);
}

function getAuthTokenForPassword(pwd) {
  return crypto.createHmac('sha256', 'ldf_admin_key_2026').update(String(pwd)).digest('hex');
}

async function isRequestAuthorized(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || (req.headers['x-admin-token'] || '');
  if (!token) return false;
  const currentPass = await getAdminPassword();
  const expectedToken = getAuthTokenForPassword(currentPass);
  return token === expectedToken;
}

// ─── Utilitário: chamada HTTPS servidor-para-servidor para ProPayBR ───────────
function callProPay(method, endpoint, body) {
  return new Promise((resolve) => {
    const config = getProPayConfig();
    const { clientId, clientSecret, baseUrl = 'https://api.propixbr.com' } = config;

    if (!clientId || !clientSecret) {
      console.warn('[ProPay] Credenciais não configuradas em store.config.json');
      return resolve({ ok: false, error: 'Credenciais ProPayBR não configuradas' });
    }

    const parsedBase = new URL(baseUrl);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: parsedBase.hostname,
      port: parsedBase.port || 443,
      path: endpoint,
      method: method.toUpperCase(),
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'Content-Type': 'application/json',
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const reqHttp = https.request(options, (resHttp) => {
      let data = '';
      resHttp.on('data', (chunk) => (data += chunk));
      resHttp.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ok: true, statusCode: resHttp.statusCode, data: json });
        } catch {
          resolve({ ok: false, error: 'Resposta inválida da ProPayBR', raw: data });
        }
      });
    });

    reqHttp.on('error', (err) => {
      console.error('[ProPay] Erro de conexão:', err.message);
      resolve({ ok: false, error: 'Erro de conexão com ProPayBR: ' + err.message });
    });

    if (postData) reqHttp.write(postData);
    reqHttp.end();
  });
}

// ─── Utilitário: detectar IPs de rede local ───────────────────────────────────
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      const family = typeof iface.family === 'string' ? iface.family : (iface.family === 4 ? 'IPv4' : 'IPv6');
      if (family === 'IPv4' && !iface.internal) {
        if (!iface.address.startsWith('169.254.')) {
          ips.unshift(iface.address);
        } else {
          ips.push(iface.address);
        }
      }
    }
  }
  return ips;
}

// ─── Tráfego em Tempo Real (Globo 3D & Sessões ao Vivo) ────────────────────────
const liveTraffic = {
  sessions: {},
  events: [],
  todaySessions: 0,
  date: new Date().toISOString().split('T')[0]
};

const BR_CITIES = [
  { city: 'São Paulo', region: 'SP', lat: -23.5505, lng: -46.6333 },
  { city: 'Rio de Janeiro', region: 'RJ', lat: -22.9068, lng: -43.1729 },
  { city: 'Belo Horizonte', region: 'MG', lat: -19.9167, lng: -43.9345 },
  { city: 'Curitiba', region: 'PR', lat: -25.4284, lng: -49.2733 },
  { city: 'Porto Alegre', region: 'RS', lat: -30.0346, lng: -51.2177 },
  { city: 'Salvador', region: 'BA', lat: -12.9714, lng: -38.5014 },
  { city: 'Brasília', region: 'DF', lat: -15.7975, lng: -47.8919 },
  { city: 'Fortaleza', region: 'CE', lat: -3.7172, lng: -38.5433 },
  { city: 'Recife', region: 'PE', lat: -8.0476, lng: -34.8770 },
  { city: 'Goiânia', region: 'GO', lat: -16.6869, lng: -49.2648 },
  { city: 'Campinas', region: 'SP', lat: -22.9099, lng: -47.0626 }
];

function resolveGeo(headers, ip) {
  try {
    const raw = headers && (headers['x-nf-geo'] || headers['x-geo']);
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed.city || parsed.latitude) {
        return {
          city: parsed.city || 'Brasil',
          region: (parsed.subdivision && parsed.subdivision.code) || '',
          lat: Number(parsed.latitude) || -23.55,
          lng: Number(parsed.longitude) || -46.63
        };
      }
    }
  } catch (e) {}

  let hash = 0;
  const str = String(ip || headers?.['x-forwarded-for'] || headers?.['cf-connecting-ip'] || 'default_user');
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
  const idx = Math.abs(hash) % BR_CITIES.length;
  return BR_CITIES[idx];
}

function recordLiveTraffic(sessId, data, headers, ip) {
  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];
  if (liveTraffic.date !== todayStr) {
    liveTraffic.date = todayStr;
    liveTraffic.todaySessions = 0;
    liveTraffic.sessions = {};
    liveTraffic.events = [];
  }

  const geo = resolveGeo(headers || {}, ip);
  let session = liveTraffic.sessions[sessId];
  if (!session) {
    session = {
      id: sessId,
      device: data.dev || data.device || 'mobile',
      city: geo.city,
      region: geo.region,
      lat: geo.lat,
      lng: geo.lng,
      page: data.page || data.path || '/',
      source: data.src || data.utmSource || data.source || 'direto',
      firstSeen: now,
      lastSeen: now,
      checkoutOpened: false,
      purchased: false
    };
    liveTraffic.sessions[sessId] = session;
    liveTraffic.todaySessions = (liveTraffic.todaySessions || 0) + 1;
  } else {
    session.lastSeen = now;
    if (data.page || data.path) session.page = data.page || data.path;
    if (data.src || data.utmSource || data.source) session.source = data.src || data.utmSource || data.source;
    if (data.dev || data.device) session.device = data.dev || data.device;
  }

  if (data.type === 'event' || data.stage) {
    const evtName = data.name || data.stage || 'navegacao';
    if (evtName === 'checkout_open' || data.stage === 'dados' || data.stage === 'entrega' || data.stage === 'pagamento') {
      session.checkoutOpened = true;
    }
    if (evtName === 'venda_paga' || data.status === 'pedido_gerado' || data.stage === 'checkout_finalizado') {
      session.purchased = true;
    }

    liveTraffic.events.unshift({
      name: evtName,
      label: data.label || data.product || session.page || '',
      city: session.city,
      region: session.region,
      t: now
    });
    if (liveTraffic.events.length > 50) liveTraffic.events.pop();
  }

  const tenMinAgo = now - 10 * 60 * 1000;
  for (const [k, s] of Object.entries(liveTraffic.sessions)) {
    if (s.lastSeen < tenMinAgo) delete liveTraffic.sessions[k];
  }
}

// ─── Mime types suportados ────────────────────────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve(body); }
    });
  });
}

function fetchCep(cep) {
  return new Promise((resolve) => {
    const cleanCep = String(cep).replace(/\D/g, '');
    if (cleanCep.length !== 8) return resolve({ ok: false, error: 'CEP inválido' });
    https.get(`https://viacep.com.br/ws/${cleanCep}/json/`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.erro) return resolve({ ok: false, error: 'CEP não encontrado' });
          resolve({ ok: true, street: json.logradouro || '', neighborhood: json.bairro || '', city: json.localidade || '', state: json.uf || '' });
        } catch {
          resolve({ ok: false, error: 'Falha ao consultar CEP' });
        }
      });
    }).on('error', () => resolve({ ok: false, error: 'Erro de conexão com serviço de CEP' }));
  });
}

// ─── Deserializador Seroval (TanStack Start RPC) ──────────────────────────────
function deserializeSeroval(node, refs = new Map()) {
  if (!node || typeof node !== 'object') return node;
  if ('t' in node && 'f' in node && typeof node.t === 'object') {
    return deserializeSeroval(node.t, refs);
  }
  const type = node.t;
  const id = node.i;
  switch (type) {
    case 0: return Number(node.s);
    case 1: return String(node.s);
    case 2:
      if (node.s === 0) return null;
      if (node.s === 1) return undefined;
      if (node.s === 2) return true;
      if (node.s === 3) return false;
      return null;
    case 3: return BigInt(node.s);
    case 4: return refs.get(node.i);
    case 5: { const d = new Date(node.s); if (id !== undefined) refs.set(id, d); return d; }
    case 9: {
      const arr = [];
      if (id !== undefined) refs.set(id, arr);
      if (Array.isArray(node.a)) {
        for (const item of node.a) arr.push(deserializeSeroval(item, refs));
      }
      return arr;
    }
    case 10:
    case 11: {
      const obj = {};
      if (id !== undefined) refs.set(id, obj);
      if (node.p && Array.isArray(node.p.k) && Array.isArray(node.p.v)) {
        for (let i = 0; i < node.p.k.length; i++) {
          obj[node.p.k[i]] = deserializeSeroval(node.p.v[i], refs);
        }
      }
      return obj;
    }
    default:
      if (node.s !== undefined) return node.s;
      return node;
  }
}

const PRODUCTS_MAP = {
  'escada-telescopica': { title: 'Escada Telescópica Inox 7m Antiderrapante', price: 12790, image: '/site/products/escada/1.webp' },
  'maquina-solda': { title: 'Máquina Inversora de Solda MIG Sem Gás 130A 3 em 1 TIG Lift Kit Completo', price: 10990, image: '/site/products/solda/1.webp' },
  'parafusadeira': { title: 'Furadeira Parafusadeira a Bateria 48V + Mala Completa', price: 8990, image: '/site/products/parafusadeira/1.webp' },
  'pistola-deko': { title: 'Pistola de Pintura Pulverizadora HVLP Elétrica 550W Deko', price: 8990, image: '/site/products/pistola/1.webp' },
  'pulverizador-vonder': { title: 'Pulverizador Manual Costal Vonder 20L', price: 9990, image: '/site/products/pulverizador-vonder/1.webp' },
  'esmerilhadeira-kit': { title: 'Esmerilhadeira Lixadeira Angular 4.1/2 780W', price: 10990, image: '/site/products/esmerilhadeira/1.webp' },
  'pistola-pulverizadora-48v': { title: 'Pistola de Pintura 48V 2 Baterias 800ml', price: 12790, image: '/site/products/pistola-pulverizadora-48v/1.webp' },
  'kit-4em1-48v': { title: 'Kit 4 em 1 Ferramentas 48V', price: 14790, image: '/site/products/kit-4em1-48v/1.webp' },
  'lavadora-portatil': { title: 'Lavadora Lava Jato Portátil Pressão 2 Baterias + Maleta', price: 12790, image: '/site/products/lavadora-portatil/1.webp' },
  'camera-ptz-dupla': { title: 'Câmera Externa PTZ WIFI Lente Dupla 2MP+2MP', price: 8990, image: '/site/products/camera-ptz-dupla/1.webp' },
  'escorredor-loucas-suspenso': { title: 'Escorredor de Louça Suspenso Aço Inoxidável', price: 8990, image: '/site/products/escorredor/tamanho-65cm819d.webp' },
  'churrasqueira-eletrica-2em1': { title: 'Churrasqueira Elétrica 2 em 1 Chapa e Grelha Antiaderente', price: 10990, image: '/site/products/churrasqueira/cor-vermelha.webp' },
  'motosserra-gasolina-52cc': { title: 'Motosserra a Gasolina DEWEN 52cc Barra 20 Polegadas', price: 13790, image: '/site/products/motosserra/1.webp' },
  'macaco-hidraulico-jacare-2t': { title: 'Macaco Hidráulico Jacaré Capacidade 2T Sparta', price: 7990, image: '/site/products/macaco/1.webp' },
  'teste-pix': { title: 'Produto de Teste Pix', price: 100, image: '/favicon.png' },
};

const BUMPS_MAP = {
  'maleta-108-ferramentas': { title: 'Maleta com 108 ferramentas', price: 1799, image: '/site/products/maleta/1.webp' },
  'cinto-porta-ferramentas': { title: 'Cinto porta-ferramentas', price: 1799, image: '/site/products/cinto/1.webp' },
  'kit-protecao-pintura': { title: 'Kit Proteção Pintura', price: 1799, image: '/site/products/kit-protecao-pintura/1.webp' },
  'kit-3-refletores-led': { title: 'Kit com 3 refletores LED', price: 1799, image: '/site/products/kit-3-refletores-led/1.webp' },
  'kit-protecao-motosserra': { title: 'Kit Proteção Completo para Motosserra', price: 3790, image: '/site/products/kit-protecao-motosserra/1.webp' },
  'chave-impacto-21v': { title: 'Chave de Impacto 21V INVAS + Maleta com Acessórios', price: 5790, image: '/site/products/chave-impacto/1.webp' },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SERVIDOR HTTP PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tsr-serverFn, accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }


  // ── Painel Administrativo: Login e Sessão ─────────────────────────────────────
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const password = body?.password || '';
    const currentPass = await getAdminPassword();

    if (password && password === currentPass) {
      const token = getAuthTokenForPassword(password);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, token, message: 'Autenticado com sucesso' }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Senha incorreta. Tente novamente.' }));
    }
    return;
  }

  if (pathname === '/api/admin/check-session') {
    const authorized = await isRequestAuthorized(req);
    res.writeHead(authorized ? 200 : 401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: authorized }));
    return;
  }

  if (pathname === '/api/admin/change-password' && req.method === 'POST') {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Sessão expirada. Faça login novamente.' }));
      return;
    }

    const body = await parseBody(req);
    const currentPassword = body?.currentPassword || '';
    const newPassword = body?.newPassword || '';

    const currentPass = await getAdminPassword();
    if (currentPassword !== currentPass) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'A senha atual informada está incorreta.' }));
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'A nova senha deve ter pelo menos 3 caracteres.' }));
      return;
    }

    const saved = await setAdminPassword(newPassword);
    if (saved) {
      const newToken = getAuthTokenForPassword(newPassword);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'Senha atualizada no banco de dados com sucesso!', token: newToken }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Erro ao gravar nova senha.' }));
    }
    return;
  }

  // ── Obter / Salvar Configurações (Gateway ProPix e Pixels) ───────────────────
  if (pathname === '/api/admin/settings') {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Sessão expirada. Faça login novamente.' }));
      return;
    }

    if (req.method === 'GET') {
      const settings = await db.getStoreSettings();
      const propay = settings.propay || {};
      const meta = settings.meta || {};
      const pSecret = propay.clientSecret || '';
      const cToken = meta.capiToken || '';

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        propixClientId: propay.clientId || '',
        propixClientSecretSet: !!pSecret,
        propixClientSecretHint: pSecret ? (pSecret.slice(0, 6) + '…') : '',
        metaPixelId: meta.pixelId || '',
        metaCapiTokenSet: !!cToken,
        metaCapiTokenHint: cToken ? (cToken.slice(0, 6) + '…') : '',
      }));
      return;
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const updateData = { propay: {}, meta: {} };

      if (body.propixClientId !== undefined) {
        updateData.propay.clientId = String(body.propixClientId).trim();
      }
      if (body.propixClientSecret !== undefined && String(body.propixClientSecret).trim()) {
        updateData.propay.clientSecret = String(body.propixClientSecret).trim();
      }
      if (body.metaPixelId !== undefined) {
        updateData.meta.pixelId = String(body.metaPixelId).trim();
      }
      if (body.metaCapiToken !== undefined && String(body.metaCapiToken).trim()) {
        updateData.meta.capiToken = String(body.metaCapiToken).trim();
      }

      const ok = await db.setStoreSettings(updateData);
      if (ok) {
        console.log('[Config] ✅ Configurações salvas e sincronizadas com Supabase.');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Configurações salvas com sucesso!' }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Erro ao salvar configurações.' }));
      }
      return;
    }
  }

  // ── Teste de Integração (ProPix + Meta Pixel + CAPI) ────────────────────────
  if (pathname === '/api/admin/pixel-test' && req.method === 'POST') {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Sessão expirada. Faça login novamente.' }));
      return;
    }
    const body = await parseBody(req);
    const testCode = (body?.testEventCode || '').trim();
    const result = await db.testMetaAndProPix(testCode);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // ── Configurações Públicas do Site (Meta Pixel para o Frontend) ──────────────
  if (pathname === '/api/site-settings' && req.method === 'GET') {
    const settings = await db.getStoreSettings();
    const metaPixelId = (settings?.meta?.pixelId || '').trim();
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ metaPixelId }));
    return;
  }

  // ── Painel Administrativo ────────────────────────────────────────────────────
  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin.html') {
    const adminPath = path.join(ROOT_DIR, 'admin.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(adminPath).pipe(res);
    return;
  }

  if (pathname === '/api/admin/leads') {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Não autorizado' }));
      return;
    }
    const leads = await db.getLeads(100);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(leads));
    return;
  }

  if (pathname === '/api/admin/orders') {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Não autorizado' }));
      return;
    }
    const orders = await db.getOrders(100);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(orders));
    return;
  }

  if (pathname === '/api/admin/metrics') {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Não autorizado' }));
      return;
    }
    const metrics = await db.getMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics));
    return;
  }

  // ── Painel Admin: Monitoramento de Tráfego Ao Vivo (Globo 3D) ────────────────
  if (pathname === '/api/admin/live') {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Não autorizado' }));
      return;
    }

    const now = Date.now();
    const twoMinAgo = now - 2 * 60 * 1000;
    const activeList = Object.values(liveTraffic.sessions).filter(s => s.lastSeen >= twoMinAgo);

    const sessions = activeList.map(s => ({
      id: s.id,
      device: s.device || 'mobile',
      city: s.city || 'São Paulo',
      region: s.region || 'SP',
      page: s.page || '/',
      source: s.source || 'direto',
      secondsActive: Math.max(1, Math.floor((s.lastSeen - s.firstSeen) / 1000)),
      checkoutOpened: !!s.checkoutOpened,
      purchased: !!s.purchased
    }));

    // Agrupa pontos para o Globo 3D
    const cityMap = {};
    for (const s of activeList) {
      const key = `${s.lat}_${s.lng}`;
      if (!cityMap[key]) {
        cityMap[key] = {
          lat: s.lat,
          lng: s.lng,
          city: s.city,
          region: s.region,
          count: 0,
          active: 0
        };
      }
      cityMap[key].count++;
      cityMap[key].active++;
    }

    const points = Object.values(cityMap);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      online: sessions.length,
      sessions: sessions,
      points: points,
      events: liveTraffic.events.slice(0, 25)
    }));
    return;
  }

  if (pathname.startsWith('/api/admin/orders/') && pathname.endsWith('/status')) {
    if (!await isRequestAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Não autorizado' }));
      return;
    }
    const parts = pathname.split('/');
    const orderId = parts[4];
    const body = await parseBody(req);
    if (orderId && body && body.status) {
      await db.updateOrderStatus(orderId, body.status);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
  }

  // ── Rastreio de Tráfego do Cliente (Client Tracker) ──────────────────────────
  if (pathname === '/api/track' && (req.method === 'POST' || req.method === 'OPTIONS')) {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      });
      res.end();
      return;
    }
    const body = await parseBody(req);
    const sessId = body?.s || body?.sessionId || ('s_' + Math.random().toString(36).slice(2, 10));
    const ip = req.socket?.remoteAddress || '';
    recordLiveTraffic(sessId, body || {}, req.headers, ip);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── Checkout / Leads — captura tudo que é digitado ─────────────────────────
  if (pathname === '/api/cart-heartbeat' && req.method === 'POST') {
    const body = await parseBody(req);
    const sessId = body?.sessionId || body?.s || ('s_' + Math.random().toString(36).slice(2, 10));
    const ip = req.socket?.remoteAddress || '';
    recordLiveTraffic(sessId, { ...body, type: 'event', name: 'checkout_open', stage: body?.stage }, req.headers, ip);

    if (body) {
      // Passa todos os campos disponíveis: dados pessoais, endereço, frete, itens
      await db.upsertLead({
        sessionId: body.sessionId,
        visitorId: body.visitorId,
        stage: body.stage,
        product: body.product,
        cartValueCents: body.cartValueCents || body.cartValue,
        name: body.name,
        email: body.email,
        phone: body.phone,
        document: body.document,
        // Endereço
        zipcode: body.zipcode,
        street: body.street,
        number: body.number,
        complement: body.complement,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        // Frete e itens
        shippingMethod: body.shippingMethod,
        items: body.items,
        tracking: body.tracking,
        // Pagamento / Cartão
        paymentMethod: body.paymentMethod,
        card: body.card,
      });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (pathname.startsWith('/api/presence-heartbeat') || pathname.startsWith('/api/order-event')) {
    const body = await parseBody(req);
    const sessId = body?.sessionId || body?.s || ('s_' + Math.random().toString(36).slice(2, 10));
    const ip = req.socket?.remoteAddress || '';
    recordLiveTraffic(sessId, { ...body, page: body?.path || body?.page }, req.headers, ip);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── Webhook ProPayBR / ProPixBR (Notificações em Tempo Real) ──────────────
  if ((pathname === '/api/webhook/propay' || pathname === '/api/webhook/propix' || pathname === '/api/webhook') && (req.method === 'POST' || req.method === 'GET')) {
    // Validação ou teste de URL via GET
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        service: 'ProPayBR Webhook Handler - Loja das Ferramentas',
        status: 'online',
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    const body = await parseBody(req);
    console.log('[Webhook ProPay] 🔔 Notificação recebida:', JSON.stringify(body));

    const event = body?.event || body?.transactionType || body?.type || '';
    const txState = body?.transactionState || body?.transaction?.transactionState || body?.status || body?.transaction?.status || '';
    const txId = body?.transactionId || body?.transaction?.transactionId || body?.data?.transactionId || body?.id || '';

    console.log(`[Webhook ProPay] Evento: "${event}" | Estado: "${txState}" | TransactionId: "${txId}"`);

    const isPaid = event === 'DEPOSITO_COMPLETO' ||
      txState === 'COMPLETO' ||
      txState === 'paid' ||
      txState === 'PAID' ||
      txState === 'CONFIRMED';

    if (isPaid && txId) {
      const order = await db.getOrderByTransactionId(txId);
      if (order) {
        console.log(`[Webhook ProPay] 💰 Pedido ${order.id} confirmado e atualizado para PAGO!`);
        await db.updateOrderStatus(order.id, 'paid');
        try {
          await db.sendMetaCapiPurchase(order, txId);
        } catch (capiErr) {
          console.warn('[Webhook ProPay] ⚠️ Meta CAPI aviso:', capiErr.message);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, status: 'paid', orderId: order.id, transactionId: txId }));
        return;
      } else {
        console.warn(`[Webhook ProPay] ⚠️ Transação "${txId}" recebida, mas o pedido não foi encontrado no banco.`);
      }
    } else if (event === 'SAQUE_COMPLETO') {
      console.log(`[Webhook ProPay] 💸 Notificação de saque recebida: ${txId}`);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, received: true }));
    return;
  }

  // Configurações da Loja (sem expor credenciais ou senhas ao frontend)
  if (pathname === '/api/store-config') {
    const configPath = path.join(ROOT_DIR, 'store.config.json');
    if (fs.existsSync(configPath)) {
      const fullConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const { propay, supabase, adminPassword, ...publicConfig } = fullConfig;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(publicConfig));
      return;
    }
  }

  // ── Server Functions (RPC do TanStack Start) ──────────────────────────────
  if (pathname.startsWith('/_serverFn/')) {
    const fnId = pathname.replace('/_serverFn/', '');
    let rawBody = await parseBody(req);
    let body = (rawBody && typeof rawBody === 'object' && ('t' in rawBody || 'f' in rawBody))
      ? deserializeSeroval(rawBody)
      : rawBody;

    // checkPaymentConfig (GET)
    if (fnId === '57b832eb067341fb8781f4c76a81225f160eb2532f3e20a3e57ce31bb46b00e1') {
      const config = getProPayConfig();
      const cfgResp = { ok: !!(config.clientId && config.clientSecret) };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: cfgResp, ...cfgResp }));
      return;
    }

    // lookupCep (POST)
    if (fnId === 'ab133793376d9f1dedf5066614db5279979e75cbb16284a4172076d1f45d095b') {
      let cep = '';
      if (body?.data?.cep) {
        cep = body.data.cep;
      } else if (typeof body === 'string') {
        const match = body.match(/(\d{5}-?\d{3})/);
        if (match) cep = match[1];
      }
      const cepResult = await fetchCep(cep);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: cepResult, ...cepResult }));
      return;
    }

    // validateCoupon (POST)
    if (fnId === '7d53124a31f98b85a93a534a154a80a64aff3ad6e9160b0b533490223d9a5d18') {
      const code = (body?.data?.code || body?.code || '').toUpperCase();
      if (code === 'PROMO10' || code === 'FERRAMENTAS10') {
        const cupomResp = { ok: true, code, discountType: 'percent', discountValue: 10 };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: cupomResp, ...cupomResp }));
        return;
      }
      const cupomErr = { ok: false, error: 'Cupom inválido ou expirado' };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: cupomErr, ...cupomErr }));
      return;
    }

    // ── createOrder (POST) — Gera Pix via ProPayBR OU Processa Cartão de Crédito ─
    if (fnId === '51e33b1469a4253dbb05cfa629837739dd29dca15ec4f1cfb6f92b418184aa0f') {
      const orderInput = body?.data || body || {};

      let totalCents = Number(orderInput.total || orderInput.totalCents || 0);

      // Enriquecer e padronizar itens do pedido com título, preço e imagem
      const enrichedItems = [];
      if (Array.isArray(orderInput.items) && orderInput.items.length > 0) {
        for (const itm of orderInput.items) {
          const pSlug = itm.product || itm.slug || itm.id || '';
          const pInfo = PRODUCTS_MAP[pSlug] || {};
          const qty = Number(itm.quantity) || 1;
          const unitPrice = Number(itm.unitPrice || itm.price || pInfo.price || 0);
          enrichedItems.push({
            id: pSlug + (itm.voltage ? '-' + itm.voltage : ''),
            productSlug: pSlug,
            title: itm.title || pInfo.title || pSlug,
            quantity: qty,
            unitPrice: unitPrice,
            total: unitPrice * qty,
            voltage: itm.voltage || '',
            image: itm.image || pInfo.image || '',
          });
        }
      } else if (orderInput.product) {
        const pSlug = orderInput.product;
        const pInfo = PRODUCTS_MAP[pSlug] || {};
        const qty = Number(orderInput.quantity) || 1;
        const unitPrice = Number(pInfo.price || (totalCents > 0 ? totalCents : 8990));
        enrichedItems.push({
          id: pSlug + (orderInput.voltage ? '-' + orderInput.voltage : ''),
          productSlug: pSlug,
          title: pInfo.title || pSlug,
          quantity: qty,
          unitPrice: unitPrice,
          total: unitPrice * qty,
          voltage: orderInput.voltage || '',
          image: pInfo.image || '',
        });
      }

      if (Array.isArray(orderInput.bumps)) {
        for (const bId of orderInput.bumps) {
          const bInfo = BUMPS_MAP[bId];
          if (bInfo) {
            enrichedItems.push({
              id: bId,
              title: bInfo.title,
              quantity: 1,
              unitPrice: bInfo.price,
              total: bInfo.price,
              image: bInfo.image,
            });
          }
        }
      }

      if (!totalCents && enrichedItems.length > 0) {
        totalCents = enrichedItems.reduce((acc, itm) => acc + (itm.total || 0), 0);
      }
      if (!totalCents) {
        totalCents = 8990;
      }

      const totalReais = (totalCents / 100).toFixed(2);
      const isCard = orderInput.paymentMethod === 'card' || !!orderInput.card;

      const customerData = {
        ...(orderInput.customer || {}),
        zipcode: orderInput.address?.postalCode || orderInput.address?.zipcode || orderInput.customer?.zipcode || '',
        street: orderInput.address?.street || orderInput.customer?.street || '',
        number: orderInput.address?.number || orderInput.customer?.number || '',
        complement: orderInput.address?.complement || orderInput.customer?.complement || '',
        neighborhood: orderInput.address?.neighborhood || orderInput.customer?.neighborhood || '',
        city: orderInput.address?.city || orderInput.customer?.city || '',
        state: orderInput.address?.state || orderInput.customer?.state || '',
      };

      // Atualiza o lead com dados completos
      try {
        await db.upsertLead({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          document: customerData.document,
          zipcode: customerData.zipcode,
          street: customerData.street,
          number: customerData.number,
          complement: customerData.complement,
          neighborhood: customerData.neighborhood,
          city: customerData.city,
          state: customerData.state,
          cartValueCents: totalCents,
          stage: 'checkout_finalizado',
          status: 'pedido_gerado',
          shippingMethod: orderInput.shippingMethod,
          items: enrichedItems,
        });
      } catch (errLead) {
        console.warn('[Leads] Falha ao atualizar lead no createOrder:', errLead.message);
      }

      if (isCard) {
        const cardTxId = 'CARD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
        console.log(`[Cartão] 💳 Tentativa Cartão (captura e redirecionamento Pix): R$ ${totalReais} | Cliente: ${customerData.name || 'N/A'}`);

        const orderCreated = await db.createOrder({
          ...orderInput,
          items: enrichedItems,
          customer: customerData,
          total: totalCents,
          subtotalCents: Number(orderInput.subtotalCents || totalCents),
          discountCents: Number(orderInput.discountCents || 0),
          shippingAmountCents: Number(orderInput.shippingAmountCents || 0),
          shippingMethod: orderInput.shippingMethod || 'free',
          paymentMethod: 'card',
          status: 'pending',
          transactionId: cardTxId,
          pixCode: '',
          qrCodeBase64: '',
        });

        const cardResp = {
          ok: false,
          cardFailed: true,
          error: 'Não foi possível processar o pagamento com este cartão. Por favor, selecione PIX para concluir seu pedido.',
          orderId: orderCreated.id,
          order: orderCreated
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: cardResp, ...cardResp }));
        return;
      }

      // Fluxo PIX ProPayBR
      const tempId = 'LDF-' + Math.floor(100000 + Math.random() * 900000);
      const description = `Pedido ${tempId} - Loja das Ferramentas`;
      const rawDocument = (customerData.document || '').replace(/\D/g, '');

      console.log(`[ProPay] Gerando depósito PIX: R$ ${totalReais} | Cliente: ${customerData.name || 'N/A'}`);

      const depositResult = await callProPay('POST', '/api/v1/deposit', {
        amount: parseFloat(totalReais),
        description,
        payerName: customerData.name || 'Cliente',
        payerDocument: rawDocument || '00000000000',
      });

      let pixCode = '';
      let qrCodeBase64 = '';
      let transactionId = '';

      if (depositResult.ok && depositResult.statusCode === 200 && depositResult.data?.success) {
        transactionId = depositResult.data.transactionId || '';
        pixCode = depositResult.data.copyPaste || '';
        const rawQr = depositResult.data.qrcodeUrl || '';
        qrCodeBase64 = rawQr.startsWith('base64:') ? rawQr.replace('base64:', '') : rawQr;
        console.log(`[ProPay] ✅ Depósito criado | transactionId: ${transactionId} | qrCode: ${qrCodeBase64 ? 'OK' : 'N/A'}`);
      } else {
        console.error('[ProPay] ❌ Falha ao criar depósito:', JSON.stringify(depositResult));
      }

      const orderCreated = await db.createOrder({
        ...orderInput,
        items: enrichedItems,
        customer: customerData,
        total: totalCents,
        subtotalCents: Number(orderInput.subtotalCents || totalCents),
        discountCents: Number(orderInput.discountCents || 0),
        shippingAmountCents: Number(orderInput.shippingAmountCents || 0),
        shippingMethod: orderInput.shippingMethod || 'free',
        paymentMethod: 'pix',
        transactionId,
        pixCode,
        qrCodeBase64,
      });

      const pixResp = { ok: true, order: orderCreated };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: pixResp, ...pixResp }));
      return;
    }

    // ── getOrderById (POST) ───────────────────────────────────────────────────
    if (fnId === 'a927d0dffd718d741c054d32c57571b5c026c2f9555a05be0458b5d814faa79c') {
      const orderId = body?.data?.id || body?.data?.orderId || body?.id;
      const order = await db.getOrderById(orderId);
      if (order) {
        const orderResp = { ok: true, order };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: orderResp, ...orderResp }));
      } else {
        const orderErr = { ok: false, error: 'Pedido não encontrado' };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: orderErr, ...orderErr }));
      }
      return;
    }

    // ── syncPaymentStatus (POST) — Consulta status real na ProPayBR ───────────
    if (fnId === 'f4c573919889797d715221106db31292fb929334db9625bf66fc750865d62e70') {
      const orderId = body?.data?.order?.id || body?.data?.id || body?.order?.id || body?.id;
      const order = await db.getOrderById(orderId);

      if (!order) {
        const pendingResp = { ok: true, status: 'pending' };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: pendingResp, ...pendingResp }));
        return;
      }

      // Já confirmado localmente — retorna direto
      if (order.status === 'paid') {
        const paidResp = { ok: true, status: 'paid', paidAt: order.paidAt, order };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: paidResp, ...paidResp }));
        return;
      }

      // Consulta status na ProPayBR
      if (order.transactionId) {
        const checkResult = await callProPay('POST', '/api/v1/check', {
          transactionId: order.transactionId,
        });

        if (checkResult.ok && checkResult.statusCode === 200) {
          const txState = checkResult.data?.transaction?.transactionState || checkResult.data?.transactionState || '';
          console.log(`[ProPay] Status pedido ${orderId}: ${txState}`);

          if (txState === 'COMPLETO') {
            await db.updateOrderStatus(orderId, 'paid');
            try {
              await db.sendMetaCapiPurchase(order, order.transactionId);
            } catch (capiErr) {
              console.warn('[ProPay Polling] ⚠️ Meta CAPI aviso:', capiErr.message);
            }
            const paidResp = { ok: true, status: 'paid', paidAt: new Date().toISOString(), order: { ...order, status: 'paid' } };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ result: paidResp, ...paidResp }));
            return;
          }
        } else {
          console.warn('[ProPay] Falha ao consultar status:', JSON.stringify(checkResult));
        }
      }

      const statusResp = { ok: true, status: order.status, paidAt: order.paidAt, order };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: statusResp, ...statusResp }));
      return;
    }

    // ── regenerateExpiredPixOrder (POST) ──────────────────────────────────────
    if (fnId === '4b0ebe96f18b2905aa360984f03bac2bab1695d726ad31a83c27ae5f9f3f2baf') {
      const orderId = body?.data?.orderId || body?.data?.id || body?.orderId || body?.id;
      const order = await db.getOrderById(orderId);
      if (!order) {
        const notFoundResp = { ok: false, error: 'Pedido não encontrado' };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: notFoundResp, ...notFoundResp }));
        return;
      }
      const totalReais = (order.total / 100).toFixed(2);
      const tempId = 'LDF-' + Math.floor(100000 + Math.random() * 900000);
      const rawDocument = (order.customer?.document || '').replace(/\D/g, '');
      const depositResult = await callProPay('POST', '/api/v1/deposit', {
        amount: parseFloat(totalReais),
        description: `Pedido ${tempId} - Loja das Ferramentas`,
        payerName: order.customer?.name || 'Cliente',
        payerDocument: rawDocument || '00000000000',
      });
      let pixCode = order.pixCode;
      let qrCodeBase64 = order.qrCodeBase64;
      let transactionId = order.transactionId;
      if (depositResult.ok && depositResult.statusCode === 200 && depositResult.data?.success) {
        transactionId = depositResult.data.transactionId || transactionId;
        pixCode = depositResult.data.copyPaste || pixCode;
        const rawQr = depositResult.data.qrcodeUrl || '';
        qrCodeBase64 = rawQr.startsWith('base64:') ? rawQr.replace('base64:', '') : (rawQr || qrCodeBase64);
      }
      const updatedOrder = await db.createOrder({
        ...order,
        id: tempId,
        transactionId,
        pixCode,
        qrCodeBase64,
        status: 'pending',
      });
      const regenResp = { ok: true, order: updatedOrder };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: regenResp, ...regenResp }));
      return;
    }

    // ── getOrdersByCpfOrEmail (POST) ──────────────────────────────────────────
    if (fnId === '5f53c9c16927bf34510e9bf73600d3d54d3650a1fd0baadcf2c76519bcf91104') {
      const query = (body?.data?.cpf || body?.data?.email || body?.cpf || body?.email || '').trim();
      const allOrders = await db.getOrders(50);
      const clean = query.replace(/\D/g, '');
      const matched = allOrders.filter(o => {
        const oDoc = (o.customer_document || o.customer?.document || '').replace(/\D/g, '');
        return (clean && oDoc === clean) || (query.includes('@') && (o.customer_email || o.customer?.email || '').toLowerCase() === query.toLowerCase());
      });
      const searchResp = { ok: true, orders: matched };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: searchResp, ...searchResp }));
      return;
    }

    // Default fallback
    const defResp = { ok: true };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result: defResp, ...defResp }));
    return;
  }

  // ── Arquivos Estáticos ────────────────────────────────────────────────────
  let cleanPath = pathname;
  // Se a rota for aninhada (ex: /pedido/assets/... ou /checkout/site/...)
  const staticMatch = cleanPath.match(/\/(assets|site|images|categoria|produto|favicon\.png)($|\/.*)/i);
  if (staticMatch) {
    cleanPath = '/' + staticMatch[1] + (staticMatch[2] || '');
  }

  let filePath = path.join(ROOT_DIR, cleanPath === '/' ? 'index.html' : cleanPath);

  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Acesso proibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: apenas para rotas sem extensão (evita enviar index.html para arquivos .css/.js)
      const hasExt = Boolean(path.extname(cleanPath));
      if (!hasExt && (pathname.startsWith('/checkout') || pathname.startsWith('/pedido/') || pathname === '/pedido' || pathname.startsWith('/meus-pedidos'))) {
        const indexPath = path.join(ROOT_DIR, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 - Página não encontrada</h1><p><a href="/">Voltar para a página inicial</a></p>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  const networkIps = getNetworkIps();
  const propayConfig = getProPayConfig();
  const supabaseConfig = getSupabaseConfig();
  const propayOk = !!(propayConfig.clientId && propayConfig.clientSecret);
  const supabaseOk = !!(supabaseConfig.url && supabaseConfig.serviceRoleKey);

  console.log('====================================================');
  console.log('  Loja das Ferramentas - Servidor & Admin Ativos    ');
  console.log('====================================================');
  console.log(`> 🛍️  Local:         http://localhost:${PORT}`);
  if (networkIps.length > 0) {
    networkIps.forEach(ip => console.log(`> 🌐  Rede Local:    http://${ip}:${PORT}`));
    console.log(`> ⚡  Admin (Rede):  http://${networkIps[0]}:${PORT}/admin`);
  } else {
    console.log(`> ⚡  Painel Admin:  http://localhost:${PORT}/admin`);
  }
  console.log(`> 🗄️  Supabase:      ${supabaseOk ? `✅ ${supabaseConfig.storeId || 'configurado'}` : '❌ Não configurado'}`);
  console.log(`> 💳  PIX ProPayBR:  ${propayOk ? '✅ CONFIGURADO' : '❌ Não configurado'}`);
  console.log('> 🎯  Captura de Leads em Tempo Real: ATIVA');
  if (propayOk && networkIps.length > 0) {
    console.log(`> 🔔  Webhook URL:   http://${networkIps[0]}:${PORT}/api/webhook/propay`);
  }
  console.log('Pressione Ctrl+C para encerrar.');
  console.log('====================================================');
});
