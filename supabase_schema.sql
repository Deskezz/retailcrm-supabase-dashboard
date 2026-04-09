-- SQL для создания таблицы orders в Supabase

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'new',
  customer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для быстрого поиска по external_id
CREATE INDEX idx_orders_external_id ON orders(external_id);

-- Индекс для фильтрации по статусу
CREATE INDEX idx_orders_status ON orders(status);

-- Индекс для сортировки по дате
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
