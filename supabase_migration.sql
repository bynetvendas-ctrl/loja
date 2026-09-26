-- ============================================================
-- Loja das Ferramentas — Migração Supabase (VERSÃO COMPLETA)
-- Execute no: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Tabela de Leads ─────────────────────────────────────────
-- Captura TUDO que o cliente digita no checkout em tempo real:
-- dados pessoais, CPF, endereço completo, frete escolhido, itens.

CREATE TABLE IF NOT EXISTS leads_checkout (
  id               BIGSERIAL    PRIMARY KEY,
  store_id         TEXT         NOT NULL DEFAULT 'lojadasferramentas',
  session_id       TEXT,
  visitor_id       TEXT,

  -- Progresso no checkout
  stage            TEXT,        -- 'dados' | 'entrega' | 'pagamento'
  status           TEXT         DEFAULT 'digitando',
                                -- 'digitando' | 'pedido_gerado'

  -- Produto e valor do carrinho
  product_slug     TEXT,
  product_name     TEXT,
  cart_value_cents INTEGER      DEFAULT 0,

  -- Dados pessoais (etapa 1)
  name             TEXT,
  email            TEXT,
  phone            TEXT,
  document         TEXT,        -- CPF

  -- Endereço completo (etapa 2)
  zipcode          TEXT,
  street           TEXT,
  address_number   TEXT,
  complement       TEXT,
  neighborhood     TEXT,
  city             TEXT,
  state            TEXT,

  -- Frete escolhido (etapa 2)
  shipping_method  TEXT,        -- 'free' | 'sedex'

  -- Itens do carrinho com bumps (JSONB)
  items_json       JSONB        DEFAULT '[]'::jsonb,

  -- Rastreamento UTM
  utm_source       TEXT,
  utm_campaign     TEXT,
  utm_medium       TEXT,

  -- Timestamps
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- Índice único para UPSERT pelo par (store_id, session_id)
CREATE UNIQUE INDEX IF NOT EXISTS leads_checkout_store_session
  ON leads_checkout (store_id, session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_store_idx     ON leads_checkout (store_id);
CREATE INDEX IF NOT EXISTS leads_stage_idx     ON leads_checkout (stage);
CREATE INDEX IF NOT EXISTS leads_updated_idx   ON leads_checkout (updated_at DESC);

-- ─── Tabela de Pedidos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id                    TEXT         PRIMARY KEY,
  store_id              TEXT         NOT NULL DEFAULT 'lojadasferramentas',
  external_id           TEXT,
  transaction_id        TEXT,        -- ID da transação ProPayBR
  status                TEXT         DEFAULT 'pending',
                                     -- 'pending' | 'paid' | 'cancelled'

  -- Dados do cliente
  customer_name         TEXT,
  customer_email        TEXT,
  customer_phone        TEXT,
  customer_document     TEXT,        -- CPF

  -- Endereço de entrega
  customer_zipcode      TEXT,
  customer_street       TEXT,
  customer_number       TEXT,
  customer_complement   TEXT,
  customer_neighborhood TEXT,
  customer_city         TEXT,
  customer_state        TEXT,

  -- Frete
  shipping_method       TEXT,
  shipping_amount_cents INTEGER      DEFAULT 0,

  -- Valores financeiros (em centavos)
  subtotal_cents        INTEGER      DEFAULT 0,
  discount_cents        INTEGER      DEFAULT 0,
  total_cents           INTEGER      DEFAULT 0,

  -- Itens do pedido (JSONB)
  items_json            JSONB        DEFAULT '[]'::jsonb,

  -- Pagamento (Pix ou Cartão)
  payment_method        TEXT         DEFAULT 'pix', -- 'pix' | 'card'
  card_brand            TEXT,        -- 'Visa', 'Mastercard', 'Elo', etc.
  card_last_digits      TEXT,        -- Últimos 4 dígitos do cartão
  card_holder           TEXT,        -- Nome no cartão
  installments          INTEGER      DEFAULT 1,     -- Parcelas (1 a 12)

  -- PIX
  pix_code              TEXT,        -- Copia & Cola
  qr_code_base64        TEXT,        -- QR Code em base64

  -- Timestamps
  created_at            TIMESTAMPTZ  DEFAULT NOW(),
  paid_at               TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS pedidos_store_idx       ON pedidos (store_id);
CREATE INDEX IF NOT EXISTS pedidos_transaction_idx ON pedidos (transaction_id);
CREATE INDEX IF NOT EXISTS pedidos_status_idx      ON pedidos (status);
CREATE INDEX IF NOT EXISTS pedidos_created_idx     ON pedidos (created_at DESC);

-- ─── Atualização para tabelas já existentes (Idempotente) ───
-- Se você já criou as tabelas anteriormente, execute estes comandos:
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS card_brand TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS card_last_digits TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS card_holder TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;

ALTER TABLE leads_checkout ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE leads_checkout ADD COLUMN IF NOT EXISTS card_brand TEXT;
ALTER TABLE leads_checkout ADD COLUMN IF NOT EXISTS card_last_digits TEXT;
ALTER TABLE leads_checkout ADD COLUMN IF NOT EXISTS card_holder TEXT;
ALTER TABLE leads_checkout ADD COLUMN IF NOT EXISTS installments INTEGER;

-- ─── Segurança ────────────────────────────────────────────────
-- Acesso exclusivo via service_role key (servidor)
ALTER TABLE leads_checkout DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos        DISABLE ROW LEVEL SECURITY;

-- ─── Multi-site ───────────────────────────────────────────────
-- Para uma nova loja, basta alterar storeId em store.config.json.
-- Ex: "storeId": "minhaloja2"
-- Todos os dados ficam isolados por store_id na mesma tabela.
-- ============================================================
