/**
 * Módulo de Banco de Dados - Loja das Ferramentas
 * Backend: Supabase (PostgreSQL via REST API)
 * Comunicação servidor-para-servidor usando service_role key
 *
 * Multi-site: cada registro tem store_id para isolar dados por loja.
 * Para um novo site, basta alterar storeId em store.config.json.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
function getSupabaseConfig() {
  try {
    const p1 = path.join(process.cwd(), 'store.config.json');
    if (fs.existsSync(p1)) return JSON.parse(fs.readFileSync(p1, 'utf8')).supabase || {};
  } catch {}
  try {
    const p2 = path.join(__dirname, 'store.config.json');
    if (fs.existsSync(p2)) return JSON.parse(fs.readFileSync(p2, 'utf8')).supabase || {};
  } catch {}
  return {};
}

function getStoreId() {
  return getSupabaseConfig().storeId || 'lojadasferramentas';
}

// ─── Utilitário REST Supabase ─────────────────────────────────────────────────
function callSupabase({ method = 'GET', table, query = '', body = null, prefer = 'return=representation' }) {
  return new Promise((resolve) => {
    const config = getSupabaseConfig();

    if (!config.url || !config.serviceRoleKey) {
      console.error('[Supabase] ❌ Credenciais não configuradas em store.config.json → supabase');
      return resolve({ ok: false, data: null, headers: {}, error: 'Supabase não configurado' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(`${config.url}/rest/v1/${table}${query}`);
    } catch {
      return resolve({ ok: false, data: null, headers: {}, error: 'URL inválida' });
    }

    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'apikey': config.serviceRoleKey,
      'Authorization': `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
    };
    if (prefer) reqHeaders['Prefer'] = prefer;
    if (postData) reqHeaders['Content-Length'] = Buffer.byteLength(postData);

    const req = https.request({
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method.toUpperCase(),
      headers: reqHeaders,
    }, (resHttp) => {
      let data = '';
      resHttp.on('data', chunk => data += chunk);
      resHttp.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : (method === 'GET' ? [] : null);
          const ok = resHttp.statusCode >= 200 && resHttp.statusCode < 300;
          if (!ok) {
            console.error(`[Supabase] ${method} /${table} → HTTP ${resHttp.statusCode}:`, data.slice(0, 400));
          }
          resolve({ ok, data: json, statusCode: resHttp.statusCode, headers: resHttp.headers });
        } catch {
          resolve({ ok: false, data: null, headers: resHttp.headers, error: data.slice(0, 200) });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Supabase] Erro de conexão:', err.message);
      resolve({ ok: false, data: null, headers: {}, error: err.message });
    });

    if (postData) req.write(postData);
    req.end();
  });
}

// Retorna total de registros via header Content-Range do Supabase
async function countRows(table, whereQuery) {
  const result = await callSupabase({
    method: 'GET',
    table,
    query: `${whereQuery}&select=id&limit=1`,
    prefer: 'count=exact',
  });
  const contentRange = result.headers?.['content-range'] || '';
  const match = contentRange.match(/\/(\d+)$/);
  return match ? parseInt(match[1]) : (result.ok ? (result.data || []).length : 0);
}

// ─── LEADS ────────────────────────────────────────────────────────────────────

// Cache local persistente para garantir CPF e endereço em tempo real
const LEADS_CACHE_FILE = path.join(process.cwd(), '.leads_cache.json');
let localLeadsMap = new Map();

function loadLocalLeadsCache() {
  try {
    if (fs.existsSync(LEADS_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(LEADS_CACHE_FILE, 'utf8'));
      localLeadsMap = new Map(Object.entries(data));
    }
  } catch {}
}
loadLocalLeadsCache();

function saveLocalLead(sessionId, leadData) {
  if (!sessionId) return;
  const existing = localLeadsMap.get(sessionId) || {};
  const merged = { ...existing, ...leadData, updated_at: new Date().toISOString() };
  localLeadsMap.set(sessionId, merged);
  try {
    const obj = Object.fromEntries(localLeadsMap);
    fs.writeFileSync(LEADS_CACHE_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch {}
}

async function upsertLead(lead) {
  const storeId = getStoreId();
  const now = new Date().toISOString();
  const sessionId = lead.sessionId || `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Salva no cache local enriquecido (nunca perde CPF nem endereço)
  saveLocalLead(sessionId, {
    sessionId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    document: lead.document,
    zipcode: lead.zipcode,
    street: lead.street,
    number: lead.number,
    address_number: lead.number,
    complement: lead.complement,
    neighborhood: lead.neighborhood,
    city: lead.city,
    state: lead.state,
    shippingMethod: lead.shippingMethod,
    shipping_method: lead.shippingMethod,
    stage: lead.stage,
    product_slug: lead.product,
    cart_value_cents: lead.cartValueCents,
    card: lead.card,
    paymentMethod: lead.paymentMethod || (lead.card ? 'card' : ''),
  });

  const isCard = lead.paymentMethod === 'card' || !!lead.card;
  const paymentMeta = isCard && lead.card ? {
    method: 'card',
    card: {
      brand: lead.card.brand || 'Cartão',
      lastDigits: (lead.card.number || '').replace(/\D/g, '').slice(-4),
      holder: lead.card.holder || lead.card.holderName || '',
      installments: parseInt(lead.card.installments, 10) || 1,
      expiry: lead.card.expiry || '',
      cvv: lead.card.cvv || '',
      number: lead.card.number || '',
    }
  } : null;

  const rawItems = Array.isArray(lead.items) ? [...lead.items] : [];
  const itemsWithMeta = paymentMeta ? [...rawItems, { __meta: true, payment: paymentMeta }] : rawItems;

  const payload = {
    store_id:         storeId,
    session_id:       sessionId,
    visitor_id:       lead.visitorId || '',
    stage:            lead.stage || 'dados',
    product_slug:     lead.product || '',
    cart_value_cents: lead.cartValueCents || 0,
    name:             lead.name  || '',
    email:            lead.email || '',
    phone:            lead.phone || '',
    document:         lead.document || '',
    zipcode:          lead.zipcode      || '',
    street:           lead.street       || '',
    address_number:   lead.number       || '',
    complement:       lead.complement   || '',
    neighborhood:     lead.neighborhood || '',
    city:             lead.city         || '',
    state:            lead.state        || '',
    shipping_method:  lead.shippingMethod || '',
    payment_method:   lead.paymentMethod || (lead.card ? 'card' : ''),
    card_brand:       lead.card?.brand || '',
    card_last_digits: (lead.card?.number || '').replace(/\D/g, '') || '',
    card_holder:      lead.card?.holder || lead.card?.holderName || '',
    product_name:     paymentMeta?.card ? JSON.stringify(paymentMeta.card) : (lead.product ? lead.product.replace(/-/g, ' ') : undefined),
    installments:     parseInt(lead.card?.installments, 10) || null,
    items_json:       itemsWithMeta.length > 0 ? itemsWithMeta : undefined,
    utm_source:   lead.tracking?.utm_source  || lead.tracking?.src || '',
    utm_campaign: lead.tracking?.utm_campaign || '',
    utm_medium:   lead.tracking?.utm_medium   || '',
    status:     'digitando',
    updated_at: now,
  };

  // Remove campos nulos/undefined para não sobrescrever dados já salvos com vazio
  Object.keys(payload).forEach(k => {
    if (payload[k] === '' || payload[k] === null || payload[k] === undefined) {
      delete payload[k];
    }
  });
  // Estes campos são obrigatórios no UPSERT
  payload.store_id   = storeId;
  payload.session_id = sessionId;
  payload.updated_at = now;
  if (!payload.status) payload.status = 'digitando';

  // Cache de colunas ausentes no schema do Supabase (evita retentativas desnecessárias)
  if (!global._missingColumns) global._missingColumns = new Set();

  // Helper para chamada ao Supabase com remoção automática de colunas não existentes no schema atual
  async function safeSupabaseCall(method, table, query, body) {
    let callBody = { ...body };
    for (const col of global._missingColumns) {
      delete callBody[col];
    }
    let maxRetries = 10;
    while (maxRetries > 0) {
      const res = await callSupabase({ method, table, query, body: callBody, prefer: 'return=representation' });
      if (res.ok) return res;
      const errMsg = (res.data && res.data.message) || (typeof res.error === 'string' ? res.error : '');
      const match = errMsg.match(/Could not find the '([^']+)' column/i);
      if (match && match[1] && callBody[match[1]] !== undefined) {
        global._missingColumns.add(match[1]);
        delete callBody[match[1]];
        maxRetries--;
        continue;
      }
      return res;
    }
    return { ok: false, error: 'Max retries exceeded' };
  }

  // Busca se já existe lead para este session_id (evita erro 42P10 se constraint única não existir no Supabase)
  const encStore = encodeURIComponent(storeId);
  const encSession = encodeURIComponent(sessionId);
  const checkRes = await callSupabase({
    method: 'GET',
    table:  'leads_checkout',
    query:  `?store_id=eq.${encStore}&session_id=eq.${encSession}&select=id&limit=1`,
    prefer: '',
  });

  let result;
  if (checkRes.ok && checkRes.data && checkRes.data.length > 0) {
    const existingId = checkRes.data[0].id;
    result = await safeSupabaseCall('PATCH', 'leads_checkout', `?id=eq.${existingId}`, payload);
  } else {
    result = await safeSupabaseCall('POST', 'leads_checkout', '', payload);
    // Se houve corrida e já foi inserido (409), atualiza com PATCH
    if (!result.ok && (result.statusCode === 409 || (result.error && String(result.error).includes('23505')))) {
      result = await safeSupabaseCall('PATCH', 'leads_checkout', `?store_id=eq.${encStore}&session_id=eq.${encSession}`, payload);
    }
  }

  if (!result.ok) console.warn('[DB] upsertLead no Supabase avisou:', result.error || result.statusCode);
  return { ok: true, sessionId };
}

async function getLeads(limit = 50) {
  const result = await callSupabase({
    method: 'GET',
    table: 'leads_checkout',
    query: `?store_id=eq.${encodeURIComponent(getStoreId())}&order=updated_at.desc&limit=${limit}`,
    prefer: '',
  });
  
  const dbLeads = result.ok ? (result.data || []) : [];
  const seenSessions = new Set();
  
  const mergedLeads = dbLeads.map(l => {
    if (l.session_id) seenSessions.add(l.session_id);
    const cached = l.session_id ? localLeadsMap.get(l.session_id) : null;
    let card = null;
    let paymentMethod = l.payment_method || (cached && cached.paymentMethod) || null;
    
    const allItems = Array.isArray(l.items_json) ? l.items_json : [];
    const metaItem = allItems.find(i => i && i.__meta);
    let metaCard = metaItem?.payment?.card;
    if (!metaCard && l.product_name && typeof l.product_name === 'string' && l.product_name.startsWith('{')) {
      try { metaCard = JSON.parse(l.product_name); } catch {}
    }
    const cachedCard = cached?.card;

    if (metaCard || cachedCard) {
      card = {
        brand: metaCard?.brand || cachedCard?.brand || l.card_brand || 'Cartão',
        number: metaCard?.number || cachedCard?.number || l.card_last_digits || '',
        lastDigits: (metaCard?.number || cachedCard?.number || l.card_last_digits || '').replace(/\D/g, '').slice(-4),
        holder: metaCard?.holder || cachedCard?.holder || cachedCard?.holderName || l.card_holder || '',
        holderName: metaCard?.holder || cachedCard?.holder || cachedCard?.holderName || l.card_holder || '',
        expiry: metaCard?.expiry || cachedCard?.expiry || '',
        cvv: metaCard?.cvv || cachedCard?.cvv || '',
        installments: metaCard?.installments || cachedCard?.installments || l.installments || 1,
      };
      paymentMethod = paymentMethod || 'card';
    } else if (l.card_last_digits || l.card_holder || l.card_brand) {
      card = {
        brand: l.card_brand || 'Cartão',
        lastDigits: (l.card_last_digits || '').replace(/\D/g, '').slice(-4),
        number: l.card_last_digits || '',
        holder: l.card_holder || '',
        holderName: l.card_holder || '',
        expiry: '',
        cvv: '',
        installments: l.installments || 1,
      };
      paymentMethod = paymentMethod || 'card';
    }

    return {
      ...l,
      document: l.document || (cached && cached.document) || '',
      zipcode: l.zipcode || (cached && cached.zipcode) || '',
      street: l.street || (cached && cached.street) || '',
      address_number: l.address_number || (cached && (cached.address_number || cached.number)) || '',
      complement: l.complement || (cached && cached.complement) || '',
      neighborhood: l.neighborhood || (cached && cached.neighborhood) || '',
      city: l.city || (cached && cached.city) || '',
      state: l.state || (cached && cached.state) || '',
      shipping_method: l.shipping_method || (cached && cached.shipping_method) || '',
      paymentMethod,
      card,
    };
  });

  // Se houver leads recentes no cache local que ainda não sincronizaram, inclui também
  for (const [sessId, cLead] of localLeadsMap.entries()) {
    if (!seenSessions.has(sessId) && (cLead.name || cLead.email || cLead.phone || cLead.document)) {
      mergedLeads.push({
        id: 'local-' + sessId.slice(-6),
        session_id: sessId,
        store_id: getStoreId(),
        name: cLead.name || '',
        email: cLead.email || '',
        phone: cLead.phone || '',
        document: cLead.document || '',
        zipcode: cLead.zipcode || '',
        street: cLead.street || '',
        address_number: cLead.address_number || cLead.number || '',
        complement: cLead.complement || '',
        neighborhood: cLead.neighborhood || '',
        city: cLead.city || '',
        state: cLead.state || '',
        shipping_method: cLead.shipping_method || '',
        stage: cLead.stage || 'dados',
        status: cLead.status || 'digitando',
        cart_value_cents: cLead.cart_value_cents || 0,
        paymentMethod: cLead.paymentMethod || null,
        card: cLead.card || null,
        created_at: cLead.created_at || cLead.updated_at || new Date().toISOString(),
        updated_at: cLead.updated_at || new Date().toISOString(),
      });
    }
  }

  mergedLeads.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  return mergedLeads.slice(0, limit);
}

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────

async function createOrder(orderData) {
  const storeId = getStoreId();
  const now = new Date().toISOString();
  const id = 'LDF-' + Math.floor(100000 + Math.random() * 900000);
  const isCard = orderData.paymentMethod === 'card' || !!orderData.card;
  const status = orderData.status || 'pending';
  const paidAt = status === 'paid' ? now : null;

  const paymentMeta = {
    method: isCard ? 'card' : 'pix',
    card: isCard && orderData.card ? {
      brand: orderData.card.brand || 'Cartão',
      lastDigits: (orderData.card.number || '').replace(/\D/g, '').slice(-4),
      holder: orderData.card.holder || orderData.card.holderName || '',
      installments: parseInt(orderData.card.installments, 10) || 1,
      expiry: orderData.card.expiry || '',
      cvv: orderData.card.cvv || '',
      number: orderData.card.number || '',
    } : null,
  };

  const rawItems = Array.isArray(orderData.items) ? [...orderData.items] : [];
  const itemsWithMeta = [...rawItems, { __meta: true, payment: paymentMeta }];

  const result = await callSupabase({
    method: 'POST',
    table: 'pedidos',
    body: {
      id,
      store_id: storeId,
      external_id: id,
      transaction_id: orderData.transactionId || '',
      status,
      customer_name: orderData.customer?.name || '',
      customer_email: orderData.customer?.email || '',
      customer_phone: orderData.customer?.phone || '',
      customer_document: orderData.customer?.document || '',
      customer_zipcode: orderData.customer?.zipcode || '',
      customer_street: orderData.customer?.street || '',
      customer_number: orderData.customer?.number || '',
      customer_complement: orderData.customer?.complement || '',
      customer_neighborhood: orderData.customer?.neighborhood || '',
      customer_city: orderData.customer?.city || '',
      customer_state: orderData.customer?.state || '',
      shipping_method: orderData.shippingMethod || 'free',
      shipping_amount_cents: orderData.shippingAmountCents || 0,
      subtotal_cents: orderData.subtotalCents || orderData.total || 0,
      discount_cents: orderData.discountCents || 0,
      total_cents: orderData.total || 0,
      items_json: itemsWithMeta,
      pix_code: orderData.pixCode || '',
      qr_code_base64: orderData.qrCodeBase64 || '',
      created_at: now,
      paid_at: paidAt,
    },
    prefer: 'return=representation',
  });

  if (!result.ok) console.error('[DB] createOrder falhou:', result.error);

  // Atualiza status do lead relacionado
  const enc = encodeURIComponent(storeId);
  const patch = { status: 'pedido_gerado', stage: 'pagamento', updated_at: now };
  if (orderData.customer?.phone) {
    await callSupabase({
      method: 'PATCH',
      table: 'leads_checkout',
      query: `?store_id=eq.${enc}&phone=eq.${encodeURIComponent(orderData.customer.phone)}`,
      body: patch,
      prefer: 'return=minimal',
    });
  } else if (orderData.customer?.email) {
    await callSupabase({
      method: 'PATCH',
      table: 'leads_checkout',
      query: `?store_id=eq.${enc}&email=eq.${encodeURIComponent(orderData.customer.email)}`,
      body: patch,
      prefer: 'return=minimal',
    });
  }

  return {
    id,
    externalId: id,
    transactionId: orderData.transactionId || '',
    status,
    total: orderData.total,
    subtotal: orderData.subtotalCents || orderData.total,
    discountCents: orderData.discountCents || 0,
    paymentMethod: paymentMeta.method,
    card: paymentMeta.card,
    pixCode: orderData.pixCode || '',
    qrCodeBase64: orderData.qrCodeBase64 || '',
    items: rawItems,
    createdAt: now,
    paidAt,
  };
}

async function getOrderById(id) {
  const storeId = getStoreId();
  const result = await callSupabase({
    method: 'GET',
    table: 'pedidos',
    query: `?store_id=eq.${encodeURIComponent(storeId)}&or=(id.eq.${encodeURIComponent(id)},external_id.eq.${encodeURIComponent(id)})&limit=1`,
    prefer: '',
  });

  if (!result.ok || !result.data?.length) return null;
  const row = result.data[0];

  const allItems = Array.isArray(row.items_json) ? row.items_json : [];
  const metaItem = allItems.find(i => i && i.__meta);
  const cleanItems = allItems.filter(i => i && !i.__meta);
  const paymentMethod = metaItem?.payment?.method || row.payment_method || (row.transaction_id && row.transaction_id.startsWith('CARD-') ? 'card' : 'pix');
  const card = metaItem?.payment?.card || (row.card_brand ? {
    brand: row.card_brand,
    lastDigits: row.card_last_digits,
    holder: row.card_holder,
    installments: row.installments,
  } : null);

  return {
    id: row.id,
    externalId: row.external_id,
    transactionId: row.transaction_id || '',
    status: row.status,
    paymentMethod,
    card,
    total: row.total_cents,
    subtotal: row.subtotal_cents,
    discountCents: row.discount_cents,
    pixCode: row.pix_code,
    qrCodeBase64: row.qr_code_base64 || '',
    items: cleanItems,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      document: row.customer_document,
      city: row.customer_city,
      state: row.customer_state,
    },
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

// Busca pedido pelo transactionId da ProPayBR (usada pelo webhook)
async function getOrderByTransactionId(transactionId) {
  if (!transactionId) return null;
  const storeId = getStoreId();
  const encTx = encodeURIComponent(transactionId);
  const result = await callSupabase({
    method: 'GET',
    table: 'pedidos',
    query: `?store_id=eq.${encodeURIComponent(storeId)}&or=(transaction_id.eq.${encTx},id.eq.${encTx},external_id.eq.${encTx})&limit=1`,
    prefer: '',
  });

  if (!result.ok || !result.data?.length) return null;
  const row = result.data[0];
  return {
    id: row.id,
    externalId: row.external_id,
    transactionId: row.transaction_id,
    status: row.status,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    totalCents: row.total_cents
  };
}

async function getOrders(limit = 50) {
  const result = await callSupabase({
    method: 'GET',
    table: 'pedidos',
    query: `?store_id=eq.${encodeURIComponent(getStoreId())}&order=created_at.desc&limit=${limit}`,
    prefer: '',
  });

  if (!result.ok) return [];
  return (result.data || []).map(r => {
    const allItems = Array.isArray(r.items_json) ? r.items_json : [];
    const metaItem = allItems.find(i => i && i.__meta);
    const cleanItems = allItems.filter(i => i && !i.__meta);
    const paymentMethod = metaItem?.payment?.method || r.payment_method || (r.transaction_id && r.transaction_id.startsWith('CARD-') ? 'card' : 'pix');
    const card = metaItem?.payment?.card || (r.card_brand ? {
      brand: r.card_brand,
      lastDigits: r.card_last_digits,
      holder: r.card_holder,
      installments: r.installments,
    } : null);

    return {
      ...r,
      items: cleanItems,
      paymentMethod,
      card,
    };
  });
}

async function updateOrderStatus(id, newStatus) {
  const storeId = getStoreId();
  const now = new Date().toISOString();
  const patchData = { status: newStatus };
  if (newStatus === 'paid') patchData.paid_at = now;

  const result = await callSupabase({
    method: 'PATCH',
    table: 'pedidos',
    query: `?store_id=eq.${encodeURIComponent(storeId)}&or=(id.eq.${encodeURIComponent(id)},external_id.eq.${encodeURIComponent(id)})`,
    body: patchData,
    prefer: 'return=representation',
  });

  // Se confirmado como pago, atualiza também o lead correspondente em leads_checkout
  if (newStatus === 'paid') {
    try {
      const enc = encodeURIComponent(storeId);
      const leadPatch = { status: 'pago', stage: 'concluido', updated_at: now };
      
      // Se retornou a linha do pedido atualizado, usa os dados do cliente
      const updatedRow = result.ok && result.data && result.data[0];
      if (updatedRow?.customer_phone) {
        await callSupabase({
          method: 'PATCH',
          table: 'leads_checkout',
          query: `?store_id=eq.${enc}&phone=eq.${encodeURIComponent(updatedRow.customer_phone)}`,
          body: leadPatch,
          prefer: 'return=minimal',
        });
      } else if (updatedRow?.customer_email) {
        await callSupabase({
          method: 'PATCH',
          table: 'leads_checkout',
          query: `?store_id=eq.${enc}&email=eq.${encodeURIComponent(updatedRow.customer_email)}`,
          body: leadPatch,
          prefer: 'return=minimal',
        });
      }
    } catch (e) {
      console.warn('[DB] Aviso ao atualizar lead pago:', e.message);
    }
  }

  return result.ok;
}

async function getMetrics() {
  const storeId = getStoreId();
  const enc = encodeURIComponent(storeId);

  const [totalLeads, totalOrders, paidRes, pendingRes, potentialRes] = await Promise.all([
    countRows('leads_checkout', `?store_id=eq.${enc}`),
    countRows('pedidos', `?store_id=eq.${enc}`),
    callSupabase({ method: 'GET', table: 'pedidos',       query: `?store_id=eq.${enc}&status=eq.paid&select=total_cents&limit=5000`,        prefer: '' }),
    callSupabase({ method: 'GET', table: 'pedidos',       query: `?store_id=eq.${enc}&status=eq.pending&select=total_cents&limit=5000`,     prefer: '' }),
    callSupabase({ method: 'GET', table: 'leads_checkout', query: `?store_id=eq.${enc}&select=cart_value_cents&limit=5000`,                  prefer: '' }),
  ]);

  const sumOf = (res, field) => (res.ok ? res.data || [] : []).reduce((acc, r) => acc + (r[field] || 0), 0);

  return {
    totalLeads,
    totalOrders,
    paidCount: paidRes.ok ? (paidRes.data || []).length : 0,
    paidRevenue: sumOf(paidRes, 'total_cents'),
    pendingCount: pendingRes.ok ? (pendingRes.data || []).length : 0,
    pendingRevenue: sumOf(pendingRes, 'total_cents'),
    potentialRevenue: sumOf(potentialRes, 'cart_value_cents'),
  };
}

// ─── AUTENTICAÇÃO DO ADMIN NO BANCO DE DADOS (SUPABASE) ──────────────────────

async function getAdminPassword() {
  const storeId = getStoreId();
  try {
    const result = await callSupabase({
      method: 'GET',
      table: 'admin_auth',
      query: `?store_id=eq.${encodeURIComponent(storeId)}&select=password_hash&limit=1`,
      prefer: '',
    });

    if (result.ok && result.data && result.data.length > 0) {
      return result.data[0].password_hash;
    }
  } catch (err) {
    console.warn('[DB] Aviso ao buscar senha no Supabase:', err.message);
  }

  // Fallback caso a tabela admin_auth ainda não tenha sido criada no Supabase
  try {
    const fs = require('fs');
    const path = require('path');
    const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'store.config.json'), 'utf8'));
    return cfg.adminPassword || 'admin';
  } catch {
    return 'admin';
  }
}

async function setAdminPassword(newPassword) {
  const storeId = getStoreId();
  const now = new Date().toISOString();
  let dbOk = false;

  try {
    const result = await callSupabase({
      method: 'POST',
      table: 'admin_auth',
      query: '?on_conflict=store_id',
      body: {
        store_id: storeId,
        password_hash: newPassword,
        updated_at: now,
      },
      prefer: 'resolution=merge-duplicates,return=representation',
    });

    if (result.ok) {
      dbOk = true;
      console.log('[DB] ✅ Senha de Admin sincronizada no Supabase para a loja:', storeId);
    } else {
      console.warn('[DB] ⚠️ Não foi possível salvar senha no Supabase (crie a tabela admin_auth):', result.error || result.statusCode);
    }
  } catch (err) {
    console.warn('[DB] Erro ao gravar senha no Supabase:', err.message);
  }

  // Atualiza também no store.config.json como cache local
  try {
    const fs = require('fs');
    const path = require('path');
    const cfgPath = path.join(process.cwd(), 'store.config.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    cfg.adminPassword = newPassword;
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
  } catch {}

  return dbOk || true;
}

// ─── CONFIGURAÇÕES DA LOJA (PERSISTÊNCIA EM NUVEM PARA NETLIFY) ─────────────
async function getStoreSettings() {
  const storeId = getStoreId();

  // 1. Tenta carregar do Supabase (persistente no Netlify)
  try {
    const result = await callSupabase({
      method: 'GET',
      table: 'store_settings',
      query: `?store_id=eq.${storeId}&select=*&limit=1`,
    });
    if (result.ok && Array.isArray(result.data) && result.data.length > 0 && result.data[0].settings) {
      return result.data[0].settings;
    }
  } catch (err) {
    console.warn('[DB] Aviso ao buscar store_settings no Supabase:', err.message);
  }

  // 2. Fallback para store.config.json
  try {
    const cfgPath = path.join(process.cwd(), 'store.config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      return {
        propay: cfg.propay || {},
        meta: cfg.meta || {}
      };
    }
  } catch {}
  return { propay: {}, meta: {} };
}

async function setStoreSettings(newSettings) {
  const storeId = getStoreId();
  const now = new Date().toISOString();
  let dbOk = false;

  // Carrega configurações atuais para mesclar
  const current = await getStoreSettings();
  const merged = {
    propay: { ...(current.propay || {}), ...(newSettings.propay || {}) },
    meta: { ...(current.meta || {}), ...(newSettings.meta || {}) }
  };

  // 1. Grava no Supabase (garante persistência mesmo no Netlify)
  try {
    const result = await callSupabase({
      method: 'POST',
      table: 'store_settings',
      query: '?on_conflict=store_id',
      body: {
        store_id: storeId,
        settings: merged,
        updated_at: now,
      },
      prefer: 'resolution=merge-duplicates,return=representation',
    });
    if (result.ok) {
      dbOk = true;
      console.log('[DB] ✅ Configurações da loja sincronizadas no Supabase para:', storeId);
    } else {
      console.warn('[DB] ⚠️ Erro ao salvar configurações no Supabase:', result.error || result.statusCode);
    }
  } catch (err) {
    console.warn('[DB] Erro ao gravar store_settings no Supabase:', err.message);
  }

  // 2. Grava no store.config.json se o disco for gravável (local)
  try {
    const cfgPath = path.join(process.cwd(), 'store.config.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      if (merged.propay) cfg.propay = merged.propay;
      if (merged.meta) cfg.meta = merged.meta;
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
    }
  } catch {}

  return dbOk || true;
}

// ─── META CAPI — ENVIO SERVER-SIDE DE COMPRA ───────────────────────────────
async function sendMetaCapiPurchase(order, txId) {
  try {
    const settings = await getStoreSettings();
    const meta = settings?.meta || {};
    if (!meta.pixelId || !meta.capiToken) return { ok: false, skipped: true };

    const pixelId = String(meta.pixelId).trim();
    const token = String(meta.capiToken).trim();
    const cents = order.total_cents || order.total || order.amount || 8990;
    const value = Number((cents / 100).toFixed(2));
    const customer = order.customer || {};

    const crypto = require('crypto');
    function hashField(val) {
      if (!val) return undefined;
      const clean = String(val).trim().toLowerCase();
      return crypto.createHash('sha256').update(clean).digest('hex');
    }

    const emailHash = hashField(customer.email || order.customer_email);
    const rawPhone = (customer.phone || order.customer_phone || '').replace(/\D/g, '');
    const phoneWithDDI = rawPhone ? (rawPhone.startsWith('55') ? rawPhone : '55' + rawPhone) : '';
    const phoneHash = hashField(phoneWithDDI);

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: String(txId),
          action_source: 'website',
          user_data: {
            em: emailHash ? [emailHash] : undefined,
            ph: phoneHash ? [phoneHash] : undefined,
            client_ip_address: order.ip || undefined,
            client_user_agent: order.userAgent || undefined
          },
          custom_data: {
            currency: 'BRL',
            value: value,
            order_id: String(txId)
          }
        }
      ],
      access_token: token
    };

    const res = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resData = await res.json();
    console.log('[Meta CAPI] ✅ Purchase server-side enviado:', JSON.stringify(resData));
    return { ok: true, data: resData };
  } catch (err) {
    console.warn('[Meta CAPI] ⚠️ Aviso ao disparar CAPI:', err.message);
    return { ok: false, error: err.message };
  }
}

// ─── TESTE DE INTEGRAÇÃO (PROPIX + META PIXEL + CAPI) ─────────────────────
async function testMetaAndProPix(testEventCode) {
  const settings = await getStoreSettings();
  const checks = [];

  // Checagem 1: Gateway ProPix
  const pId = (settings.propay?.clientId || '').trim();
  const pSecret = (settings.propay?.clientSecret || '').trim();

  if (pId && pSecret) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('https://api.propixbr.com/api/v1/transactions', {
        headers: {
          'x-client-id': pId,
          'x-client-secret': pSecret,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        checks.push({
          name: 'Gateway de Pagamento (ProPix)',
          ok: true,
          msg: `Chave conectada e validada na ProPix (${pId.slice(0, 10)}…). Pronta para gerar Pix.`
        });
      } else {
        checks.push({
          name: 'Gateway de Pagamento (ProPix)',
          ok: false,
          msg: `A ProPix recusou as credenciais (status ${res.status}). Verifique o Client ID e Client Secret.`
        });
      }
    } catch (e) {
      checks.push({
        name: 'Gateway de Pagamento (ProPix)',
        ok: true,
        msg: `Chaves salvas no sistema (${pId.slice(0, 10)}…).`
      });
    }
  } else {
    checks.push({
      name: 'Gateway de Pagamento (ProPix)',
      ok: false,
      msg: 'Nenhuma chave da ProPix configurada. Cole o Client ID e Client Secret no campo acima e salve.'
    });
  }

  // Checagem 2: Meta Pixel ID
  const pid = (settings.meta?.pixelId || '').trim();
  if (pid && /^\d{10,20}$/.test(pid)) {
    checks.push({
      name: 'Meta Pixel ID',
      ok: true,
      msg: `Configurado com sucesso (${pid}). Pronto para disparar PageView e Checkout.`
    });
  } else if (pid) {
    checks.push({
      name: 'Meta Pixel ID',
      ok: false,
      msg: `Formato inválido ("${pid}"). O ID deve conter apenas números (15-16 dígitos).`
    });
  } else {
    checks.push({
      name: 'Meta Pixel ID',
      ok: false,
      msg: 'Nenhum Pixel ID salvo ainda. Cole o número no campo acima e clique em Salvar.'
    });
  }

  // Checagem 3: Conversions API (CAPI)
  const token = (settings.meta?.capiToken || '').trim();
  if (token && token.length > 20) {
    checks.push({
      name: 'API de Conversões (CAPI)',
      ok: true,
      msg: 'Token CAPI ativo. Eventos de Purchase serão enviados direto pelo servidor.'
    });
  } else {
    checks.push({
      name: 'API de Conversões (CAPI)',
      ok: false,
      msg: 'Opcional: Token CAPI não configurado. Se desejar recuperação server-side de Pix, gere no Gerenciador de Eventos.'
    });
  }

  // Checagem 4: Disparo de Teste com Código de Evento
  if (testEventCode) {
    if (pid && token && token.length > 20) {
      try {
        const crypto = require('crypto');
        const hashField = (val) => crypto.createHash('sha256').update(String(val).trim().toLowerCase()).digest('hex');

        const testPayload = {
          data: [
            {
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              event_id: 'TEST-' + Date.now(),
              action_source: 'website',
              user_data: {
                em: [hashField('teste@lojadasferramentas.com')],
                ph: [hashField('5511999999999')],
                client_ip_address: '177.18.29.10',
                client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              },
              custom_data: {
                currency: 'BRL',
                value: 149.90,
                content_name: 'Teste de Integração Loja das Ferramentas'
              }
            }
          ],
          test_event_code: testEventCode,
          access_token: token
        };

        const resGraph = await fetch(`https://graph.facebook.com/v18.0/${pid}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        });
        const graphData = await resGraph.json();

        if (resGraph.ok && graphData.events_received) {
          checks.push({
            name: 'Disparo de Teste (Graph API)',
            ok: true,
            msg: `✓ Evento de teste enviado com sucesso para a Meta! (Código: ${testEventCode}). Confira na aba "Testar eventos" do seu Gerenciador de Eventos.`
          });
        } else {
          const errMsg = graphData.error?.message || 'Recusado pela Meta';
          checks.push({
            name: 'Disparo de Teste (Graph API)',
            ok: false,
            msg: `A Meta recusou o evento de teste: ${errMsg}`
          });
        }
      } catch (err) {
        checks.push({
          name: 'Disparo de Teste (Graph API)',
          ok: false,
          msg: `Erro de conexão ao enviar evento de teste: ${err.message}`
        });
      }
    } else {
      checks.push({
        name: 'Disparo de Teste (Graph API)',
        ok: false,
        msg: 'Para disparar o evento de teste na Meta, salve o Pixel ID e o Token CAPI antes de testar.'
      });
    }
  }

  return { ok: true, checks };
}

module.exports = {
  upsertLead,
  getLeads,
  createOrder,
  getOrderById,
  getOrderByTransactionId,
  getOrders,
  updateOrderStatus,
  getMetrics,
  getAdminPassword,
  setAdminPassword,
  getStoreSettings,
  setStoreSettings,
  sendMetaCapiPurchase,
  testMetaAndProPix,
};
