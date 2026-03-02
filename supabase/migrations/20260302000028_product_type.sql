-- Aggiunge tipo di prodotto per differenziare armi da fuoco vs fuochi artificiali
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'standard'
  CHECK (product_type IN ('standard', 'arma_fuoco', 'munizioni', 'fuochi_artificiali', 'accessori'));

COMMENT ON COLUMN products.product_type IS
  'Tipo prodotto per compliance normativa: arma_fuoco e munizioni = solo ritiro in negozio; fuochi_artificiali = spedizione ADR consentita; standard/accessori = spedizione normale';
