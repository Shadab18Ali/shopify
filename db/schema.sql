CREATE TABLE IF NOT EXISTS sections (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'General',
  price         INTEGER NOT NULL,          -- smallest currency unit (cents/paise)
  currency      TEXT NOT NULL DEFAULT 'USD',
  preview_url   TEXT,
  demo_url      TEXT,
  file_url      TEXT NOT NULL,             -- never sent to the browser
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id                   SERIAL PRIMARY KEY,
  section_id           INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  email                TEXT NOT NULL,
  amount               INTEGER NOT NULL,
  currency             TEXT NOT NULL,
  razorpay_order_id    TEXT UNIQUE NOT NULL,
  razorpay_payment_id  TEXT,
  status               TEXT NOT NULL DEFAULT 'pending',   -- pending | paid
  download_token       TEXT UNIQUE NOT NULL,
  downloads            INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_requests (
  id          SERIAL PRIMARY KEY,
  section_id  INTEGER REFERENCES sections(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  store_url   TEXT NOT NULL,
  budget      TEXT NOT NULL DEFAULT '',
  details     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',   -- new | quoted | in_progress | done
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PayPal support: run npm run db:setup again, it is safe on an existing database
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'razorpay';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paypal_order_id TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;
ALTER TABLE orders ALTER COLUMN razorpay_order_id DROP NOT NULL;
