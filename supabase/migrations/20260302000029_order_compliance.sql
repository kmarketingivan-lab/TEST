-- Campi compliance per ordini di armi
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requires_pickup BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_document_type TEXT
  CHECK (pickup_document_type IN ('porto_armi', 'nulla_osta_questore', 'carta_collezionista', 'licenza_commerciale', NULL));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_document_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_document_verified BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_notes TEXT;

COMMENT ON COLUMN orders.requires_pickup IS 'True se l''ordine contiene armi da sparo o munizioni che richiedono ritiro fisico in armeria';
COMMENT ON COLUMN orders.pickup_document_type IS 'Tipo documento abilitativo presentato dal cliente per il ritiro';
COMMENT ON COLUMN orders.pickup_document_number IS 'Numero documento abilitativo';
COMMENT ON COLUMN orders.pickup_document_verified IS 'True se il personale dell''armeria ha verificato il documento fisicamente';
