-- ============================================
-- Migration 0017: reviews
-- ============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reviews_product_approved ON reviews(product_id, is_approved);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Admin can read all reviews
CREATE POLICY "Admin can view all reviews"
  ON reviews FOR SELECT
  USING (is_admin());

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admin can update reviews
CREATE POLICY "Admin can update reviews"
  ON reviews FOR UPDATE
  USING (is_admin());

-- Admin can delete reviews
CREATE POLICY "Admin can delete reviews"
  ON reviews FOR DELETE
  USING (is_admin());
