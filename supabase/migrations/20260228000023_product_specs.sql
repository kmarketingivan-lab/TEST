-- ============================================
-- Migration 0023: product specifications + regulatory_info + weight_class
-- ============================================

ALTER TABLE products ADD COLUMN specifications JSONB NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN regulatory_info TEXT;
ALTER TABLE products ADD COLUMN weight_class TEXT;
