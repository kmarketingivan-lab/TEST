-- Tabella cronologia stati ordine
-- Ogni cambio di status viene registrato con vecchio stato, nuovo stato e nota opzionale.

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  nota TEXT,
  tracking_code TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON order_status_history(order_id);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Solo admin può leggere/scrivere la cronologia
CREATE POLICY "admin_only" ON order_status_history
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE order_status_history IS
  'Cronologia completa dei cambi di stato degli ordini per audit e tracking.';
