-- ============================================
-- Migration 0025: shipping_zones + shipping_rules
-- ============================================

CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL DEFAULT '{IT}',
  min_order_free_shipping NUMERIC(10,2),
  flat_rate NUMERIC(10,2) NOT NULL,
  per_kg_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE shipping_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  min_weight_grams INTEGER NOT NULL DEFAULT 0,
  max_weight_grams INTEGER,
  price NUMERIC(10,2) NOT NULL
);

-- Indexes
CREATE INDEX idx_shipping_rules_zone ON shipping_rules(zone_id);

-- Default zone: Italy
INSERT INTO shipping_zones (name, countries, flat_rate, min_order_free_shipping, is_active)
VALUES ('Italia', '{IT}', 8.90, 150.00, true);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rules ENABLE ROW LEVEL SECURITY;

-- Public can view active zones and rules
CREATE POLICY "Public can view active shipping zones"
  ON shipping_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view shipping rules"
  ON shipping_rules FOR SELECT
  USING (true);

-- Admin CRUD
CREATE POLICY "Admin can view all shipping zones" ON shipping_zones FOR SELECT USING (is_admin());
CREATE POLICY "Admin can insert shipping zones" ON shipping_zones FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update shipping zones" ON shipping_zones FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete shipping zones" ON shipping_zones FOR DELETE USING (is_admin());

CREATE POLICY "Admin can insert shipping rules" ON shipping_rules FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update shipping rules" ON shipping_rules FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete shipping rules" ON shipping_rules FOR DELETE USING (is_admin());
