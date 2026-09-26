/**
 * Netlify Serverless Function - Loja das Ferramentas
 * Roteia chamadas de /api/* e /_serverFn/* para os serviços ProPayBR e Supabase
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
let db;
try {
  db = require('./db.js');
} catch (e1) {
  try {
    db = require('../db.js');
  } catch (e2) {
    try {
      db = require(path.join(process.cwd(), 'db.js'));
    } catch (e3) {
      db = {};
    }
  }
}

function getConfig() {
  try {
    const configPath = path.join(process.cwd(), 'store.config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch {}
  try {
    const localPath = path.join(__dirname, 'store.config.json');
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf8'));
    }
  } catch {}
  return {};
}

function getAuthTokenForPassword(pwd) {
  return crypto.createHmac('sha256', 'ldf_admin_key_2026').update(String(pwd)).digest('hex');
}

async function isAuthorized(headers) {
  const authHeader = headers['authorization'] || headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || headers['x-admin-token'] || '';
  if (!token) return false;
  const currentPass = await db.getAdminPassword();
  const expectedToken = getAuthTokenForPassword(currentPass);
  return token === expectedToken;
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
  const str = String(ip || headers?.['x-forwarded-for'] || headers?.['client-ip'] || 'default_user');
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

async function callProPay(method, endpoint, body) {
  const settings = await db.getStoreSettings();
  const cfg = settings?.propay || getConfig()?.propay || {};
  const { clientId, clientSecret, baseUrl = 'https://api.propixbr.com' } = cfg;

  return new Promise((resolve) => {
    if (!clientId || !clientSecret) {
      return resolve({ ok: false, error: 'Credenciais ProPayBR não configuradas' });
    }

    const payload = body ? JSON.stringify(body) : null;
    const urlObj = new URL(endpoint, baseUrl);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
      }
    };
    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    if (payload) req.write(payload);
    req.end();
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
    }).on('error', () => resolve({ ok: false, error: 'Erro de conexão' }));
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
  'maquina-solda': { title: 'Maquina Inversora De Solda MIG Sem Gas 130A 3 Em 1 TIG Lift Kit Completo', price: 10990, image: '/site/products/solda/1.webp' },
  'parafusadeira': { title: 'Furadeira Parafusadeira a Bateria 48V + Mala Completa', price: 8990, image: '/site/products/parafusadeira/1.webp' },
  'pistola-deko': { title: 'Pistola de Pintura Pulverizadora HVLP Eletrica 550W Deko', price: 8990, image: '/site/products/pistola/1.webp' },
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

exports.handler = async (event) => {
  const { path: rawPath, httpMethod, headers } = event;
  let pathname = rawPath || '';

  // Normalizar caminho removendo prefixo /.netlify/functions/api se houver
  pathname = pathname.replace(/^\/\.netlify\/functions\/api/, '');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tsr-serverFn, accept, x-admin-token',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  let body = null;
  if (event.body) {
    try {
      body = event.isBase64Encoded ? JSON.parse(Buffer.from(event.body, 'base64').toString('utf8')) : JSON.parse(event.body);
    } catch {
      body = event.body;
    }
  }

  // 1. Webhook ProPay / ProPixBR
  if ((pathname === '/api/webhook/propay' || pathname === '/api/webhook/propix' || pathname === '/api/webhook') && (httpMethod === 'POST' || httpMethod === 'GET')) {
    if (httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, service: 'Netlify ProPay Webhook', status: 'online' })
      };
    }

    const eventType = body?.event || body?.transactionType || body?.type || body?.transactionState || '';
    const txState = body?.transactionState || body?.transaction?.transactionState || body?.status || body?.transaction?.status || '';
    const transactionId = body?.transactionId || body?.transaction?.transactionId || body?.data?.transactionId || body?.id || '';

    const isPaid = eventType === 'DEPOSITO_COMPLETO' ||
      txState === 'COMPLETO' ||
      txState === 'paid' ||
      txState === 'PAID' ||
      txState === 'CONFIRMED';

    if (isPaid && transactionId) {
      try {
        const order = await db.getOrderByTransactionId(transactionId);
        if (order) {
          await db.updateOrderStatus(order.id, 'paid');
          try {
            await db.sendMetaCapiPurchase(order, transactionId);
          } catch (capiErr) {
            console.warn('[Netlify CAPI] Erro ao enviar Purchase:', capiErr.message);
          }
        }
      } catch (err) {
        console.error('Webhook error:', err);
      }
    }
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ received: true }) };
  }

  // 2. Admin Auth
  if (pathname === '/api/admin/login' && httpMethod === 'POST') {
    const password = body?.password || '';
    const currentPass = await db.getAdminPassword();
    if (password && password === currentPass) {
      const token = getAuthTokenForPassword(password);
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true, token, message: 'Autenticado com sucesso' }) };
    }
    return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Senha incorreta' }) };
  }

  if (pathname === '/api/admin/check-session') {
    const ok = await isAuthorized(headers);
    return { statusCode: ok ? 200 : 401, headers: corsHeaders, body: JSON.stringify({ ok }) };
  }

  if (pathname === '/api/admin/change-password' && httpMethod === 'POST') {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Não autorizado' }) };
    const curr = body?.currentPassword || '';
    const next = body?.newPassword || '';
    const currentPass = await db.getAdminPassword();
    if (curr !== currentPass) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Senha atual incorreta' }) };
    if (!next || next.length < 3) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Mínimo 3 caracteres' }) };
    await db.setAdminPassword(next);
    const newToken = getAuthTokenForPassword(next);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true, message: 'Senha atualizada!', token: newToken }) };
  }

  if (pathname === '/api/admin/settings') {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Não autorizado' }) };
    if (httpMethod === 'GET') {
      const settings = await db.getStoreSettings();
      const propay = settings.propay || {};
      const meta = settings.meta || {};
      const pSecret = propay.clientSecret || '';
      const cToken = meta.capiToken || '';
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          propixClientId: propay.clientId || '',
          propixClientSecretSet: !!pSecret,
          propixClientSecretHint: pSecret ? (pSecret.slice(0, 6) + '…') : '',
          metaPixelId: meta.pixelId || '',
          metaCapiTokenSet: !!cToken,
          metaCapiTokenHint: cToken ? (cToken.slice(0, 6) + '…') : '',
        })
      };
    }
    if (httpMethod === 'POST') {
      const updateData = { propay: {}, meta: {} };
      if (body?.propixClientId !== undefined) updateData.propay.clientId = String(body.propixClientId).trim();
      if (body?.propixClientSecret !== undefined && String(body.propixClientSecret).trim()) updateData.propay.clientSecret = String(body.propixClientSecret).trim();
      if (body?.metaPixelId !== undefined) updateData.meta.pixelId = String(body.metaPixelId).trim();
      if (body?.metaCapiToken !== undefined && String(body.metaCapiToken).trim()) updateData.meta.capiToken = String(body.metaCapiToken).trim();

      const ok = await db.setStoreSettings(updateData);
      if (ok) {
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true, message: 'Configurações salvas e sincronizadas no Supabase!' }) };
      } else {
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Erro ao gravar no banco de dados' }) };
      }
    }
  }

  // 2.2 Teste de Integração (Pixel, CAPI e ProPix)
  if (pathname === '/api/admin/pixel-test' && httpMethod === 'POST') {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Não autorizado' }) };
    const testEventCode = (body?.testEventCode || '').trim();
    const result = await db.testMetaAndProPix(testEventCode);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
  }

  // 2.3 Configurações Públicas da Loja (Meta Pixel ID para o frontend)
  if (pathname === '/api/site-settings' && httpMethod === 'GET') {
    const settings = await db.getStoreSettings();
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=60',
      },
      body: JSON.stringify({
        metaPixelId: settings.meta?.pixelId || '',
      })
    };
  }

  // 3. Admin Dados
  if (pathname === '/api/admin/leads') {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false }) };
    const leads = await db.getLeads(100);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(leads) };
  }

  if (pathname === '/api/admin/orders') {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false }) };
    const orders = await db.getOrders(100);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(orders) };
  }

  if (pathname === '/api/admin/metrics') {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false }) };
    const metrics = await db.getMetrics();
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(metrics) };
  }

  if (pathname.startsWith('/api/admin/orders/') && pathname.endsWith('/status')) {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false }) };
    const parts = pathname.split('/');
    const orderId = parts[4];
    if (orderId && body?.status) {
      await db.updateOrderStatus(orderId, body.status);
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
    }
  }

  if (pathname === '/api/admin/live') {
    if (!await isAuthorized(headers)) return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'Não autorizado' }) };

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

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        online: sessions.length,
        sessions: sessions,
        points: points,
        events: liveTraffic.events.slice(0, 25)
      })
    };
  }

  // Rastreio de Tráfego do Cliente (Client Tracker)
  if (pathname === '/api/track' && (httpMethod === 'POST' || httpMethod === 'OPTIONS')) {
    if (httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders, body: '' };
    }
    const sessId = body?.s || body?.sessionId || ('s_' + Math.random().toString(36).slice(2, 10));
    const ip = headers?.['x-nf-client-connection-ip'] || headers?.['client-ip'] || headers?.['x-forwarded-for'] || '';
    recordLiveTraffic(sessId, body || {}, headers, ip);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
  }

  // 4. Cart Heartbeat
  if (pathname === '/api/cart-heartbeat' && httpMethod === 'POST') {
    const sessId = body?.sessionId || body?.s || ('s_' + Math.random().toString(36).slice(2, 10));
    const ip = headers?.['x-nf-client-connection-ip'] || headers?.['client-ip'] || headers?.['x-forwarded-for'] || '';
    recordLiveTraffic(sessId, { ...body, type: 'event', name: 'checkout_open', stage: body?.stage }, headers, ip);
    if (body) await db.upsertLead(body);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
  }

  // 5. Store Config Pública
  if (pathname === '/api/store-config') {
    const full = getConfig();
    const { propay, supabase, adminPassword, ...publicConfig } = full;
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(publicConfig) };
  }

  // 6. Server Functions (_serverFn)
  if (pathname.startsWith('/_serverFn/')) {
    const fnId = pathname.replace('/_serverFn/', '');
    let parsedBody = body;
    if (parsedBody && typeof parsedBody === 'object' && ('t' in parsedBody || 'f' in parsedBody)) {
      parsedBody = deserializeSeroval(parsedBody);
    }

    // checkPaymentConfig
    if (fnId === '57b832eb067341fb8781f4c76a81225f160eb2532f3e20a3e57ce31bb46b00e1') {
      const settings = await db.getStoreSettings();
      const cfg = settings?.propay || getConfig()?.propay || {};
      const cfgResp = { ok: !!(cfg.clientId && cfg.clientSecret) };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: cfgResp, ...cfgResp }) };
    }

    // lookupCep
    if (fnId === 'ab133793376d9f1dedf5066614db5279979e75cbb16284a4172076d1f45d095b') {
      const cep = parsedBody?.data?.cep || (typeof parsedBody === 'string' ? (parsedBody.match(/(\d{5}-?\d{3})/) || [])[1] : '');
      const result = await fetchCep(cep);
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result, ...result }) };
    }

    // validateCoupon
    if (fnId === '7d53124a31f98b85a93a534a154a80a64aff3ad6e9160b0b533490223d9a5d18') {
      const code = (parsedBody?.data?.code || parsedBody?.code || '').toUpperCase();
      if (code === 'PROMO10' || code === 'FERRAMENTAS10') {
        const cupomResp = { ok: true, code, discountType: 'percent', discountValue: 10 };
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: cupomResp, ...cupomResp }) };
      }
      const cupomErr = { ok: false, error: 'Cupom inválido ou expirado' };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: cupomErr, ...cupomErr }) };
    }

    // createOrder (51e33b1469a4253dbb05cfa629837739dd29dca15ec4f1cfb6f92b418184aa0f)
    if (fnId === '51e33b1469a4253dbb05cfa629837739dd29dca15ec4f1cfb6f92b418184aa0f' || fnId === '3efdaea72535798436bba7ecb930d6bf7b0c950a58ca863b9ef7753696aebc72') {
      const orderPayload = parsedBody?.data || parsedBody || {};
      let totalCents = Number(orderPayload.total || orderPayload.totalCents || 0);

      const enrichedItems = [];
      if (Array.isArray(orderPayload.items) && orderPayload.items.length > 0) {
        for (const itm of orderPayload.items) {
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
      } else if (orderPayload.product) {
        const pSlug = orderPayload.product;
        const pInfo = PRODUCTS_MAP[pSlug] || {};
        const qty = Number(orderPayload.quantity) || 1;
        const unitPrice = Number(pInfo.price || (totalCents > 0 ? totalCents : 8990));
        enrichedItems.push({
          id: pSlug + (orderPayload.voltage ? '-' + orderPayload.voltage : ''),
          productSlug: pSlug,
          title: pInfo.title || pSlug,
          quantity: qty,
          unitPrice: unitPrice,
          total: unitPrice * qty,
          voltage: orderPayload.voltage || '',
          image: pInfo.image || '',
        });
      }

      if (Array.isArray(orderPayload.bumps)) {
        for (const bId of orderPayload.bumps) {
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
      if (!totalCents) totalCents = 8990;

      const totalReais = (totalCents / 100).toFixed(2);
      const isCard = orderPayload.paymentMethod === 'card' || !!orderPayload.card;

      const customerData = {
        ...(orderPayload.customer || {}),
        zipcode: orderPayload.address?.postalCode || orderPayload.address?.zipcode || orderPayload.customer?.zipcode || '',
        street: orderPayload.address?.street || orderPayload.customer?.street || '',
        number: orderPayload.address?.number || orderPayload.customer?.number || '',
        complement: orderPayload.address?.complement || orderPayload.customer?.complement || '',
        neighborhood: orderPayload.address?.neighborhood || orderPayload.customer?.neighborhood || '',
        city: orderPayload.address?.city || orderPayload.customer?.city || '',
        state: orderPayload.address?.state || orderPayload.customer?.state || '',
      };

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
          shippingMethod: orderPayload.shippingMethod,
          items: enrichedItems,
        });
      } catch (e) {}

      if (isCard) {
        const cardTxId = 'CARD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
        const orderCreated = await db.createOrder({
          ...orderPayload,
          items: enrichedItems,
          customer: customerData,
          total: totalCents,
          subtotalCents: Number(orderPayload.subtotalCents || totalCents),
          discountCents: Number(orderPayload.discountCents || 0),
          shippingAmountCents: Number(orderPayload.shippingAmountCents || 0),
          shippingMethod: orderPayload.shippingMethod || 'free',
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
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: cardResp, ...cardResp }) };
      }

      const tempId = 'LDF-' + Math.floor(100000 + Math.random() * 900000);
      const rawDocument = (customerData.document || '').replace(/\D/g, '');
      const propayResult = await callProPay('POST', '/api/v1/deposit', {
        amount: parseFloat(totalReais),
        description: `Pedido ${tempId} - Loja das Ferramentas`,
        payerName: customerData.name || 'Cliente',
        payerDocument: rawDocument || '00000000000',
      });

      let pixCode = '';
      let qrCodeBase64 = '';
      let transactionId = '';

      if (propayResult.ok && propayResult.statusCode === 200 && propayResult.data?.success) {
        transactionId = propayResult.data.transactionId || '';
        pixCode = propayResult.data.copyPaste || '';
        const rawQr = propayResult.data.qrcodeUrl || '';
        qrCodeBase64 = rawQr.startsWith('base64:') ? rawQr.replace('base64:', '') : rawQr;
      }

      const orderCreated = await db.createOrder({
        ...orderPayload,
        items: enrichedItems,
        customer: customerData,
        total: totalCents,
        subtotalCents: Number(orderPayload.subtotalCents || totalCents),
        discountCents: Number(orderPayload.discountCents || 0),
        shippingAmountCents: Number(orderPayload.shippingAmountCents || 0),
        shippingMethod: orderPayload.shippingMethod || 'free',
        paymentMethod: 'pix',
        transactionId,
        pixCode,
        qrCodeBase64,
      });

      const pixResp = { ok: true, order: orderCreated };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: pixResp, ...pixResp }) };
    }

    // getOrderById
    if (fnId === 'a927d0dffd718d741c054d32c57571b5c026c2f9555a05be0458b5d814faa79c') {
      const orderId = parsedBody?.data?.id || parsedBody?.data?.orderId || parsedBody?.id;
      const order = await db.getOrderById(orderId);
      if (order) {
        const oResp = { ok: true, order };
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: oResp, ...oResp }) };
      }
      const oErr = { ok: false, error: 'Pedido não encontrado' };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: oErr, ...oErr }) };
    }

    // syncPaymentStatus
    if (fnId === 'f4c573919889797d715221106db31292fb929334db9625bf66fc750865d62e70') {
      const orderId = body?.data?.order?.id || body?.order?.id;
      const order = await db.getOrderById(orderId);
      if (!order) {
        const pResp = { ok: true, status: 'pending' };
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: pResp, ...pResp }) };
      }
      if (order.status === 'paid') {
        const pResp = { ok: true, status: 'paid', paidAt: order.paidAt, order };
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: pResp, ...pResp }) };
      }

      if (order.transactionId) {
        const check = await callProPay('POST', '/api/v1/check', { transactionId: order.transactionId });
        if (check.ok && check.statusCode === 200) {
          const state = check.data?.transaction?.transactionState || check.data?.transactionState || '';
          if (state === 'COMPLETO') {
            await db.updateOrderStatus(orderId, 'paid');
            try {
              await db.sendMetaCapiPurchase(order, order.transactionId);
            } catch (capiErr) {
              console.warn('[Netlify Polling CAPI] Erro ao enviar Purchase:', capiErr.message);
            }
            const pResp = { ok: true, status: 'paid', paidAt: new Date().toISOString(), order: { ...order, status: 'paid' } };
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: pResp, ...pResp }) };
          }
        }
      }
      const sResp = { ok: true, status: order.status, paidAt: order.paidAt, order };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: sResp, ...sResp }) };
    }

    // regenerateExpiredPixOrder
    if (fnId === '4b0ebe96f18b2905aa360984f03bac2bab1695d726ad31a83c27ae5f9f3f2baf') {
      const orderId = body?.data?.id || body?.id;
      const order = await db.getOrderById(orderId);
      const regenResp = { ok: !!order, order };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: regenResp, ...regenResp }) };
    }

    // getOrdersByCpfOrEmail
    if (fnId === '5f53c9c16927bf34510e9bf73600d3d54d3650a1fd0baadcf2c76519bcf91104') {
      const query = (body?.data?.cpf || body?.data?.email || body?.cpf || body?.email || '').trim();
      const allOrders = await db.getOrders(50);
      const clean = query.replace(/\D/g, '');
      const matched = allOrders.filter(o => {
        const oDoc = (o.customer_document || '').replace(/\D/g, '');
        return (clean && oDoc === clean) || (query.includes('@') && o.customer_email?.toLowerCase() === query.toLowerCase());
      });
      const searchResp = { ok: true, orders: matched };
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ result: searchResp, ...searchResp }) };
    }
  }

  return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
};
