-- ============================================
-- Migration 0022: brands + products.brand_id
-- ============================================

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active);

-- Add brand_id to products
ALTER TABLE products ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX idx_products_brand ON products(brand_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Public can view all brands
CREATE POLICY "Public can view brands"
  ON brands FOR SELECT
  USING (true);

-- Admin CRUD
CREATE POLICY "Admin can insert brands" ON brands FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update brands" ON brands FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete brands" ON brands FOR DELETE USING (is_admin());
