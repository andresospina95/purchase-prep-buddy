-- Esquema mínimo: cada "lista" es un blob JSON con una clave.
-- Esto mantiene la compatibilidad con la estructura del frontend
-- y simplifica la migración desde localStorage.

CREATE TABLE IF NOT EXISTS app_kv (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consecutivo de OC (atómico)
CREATE TABLE IF NOT EXISTS oc_counter (
  id INT PRIMARY KEY DEFAULT 1,
  value INT NOT NULL DEFAULT 0,
  CONSTRAINT only_one_row CHECK (id = 1)
);

INSERT INTO oc_counter (id, value) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
