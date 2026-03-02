-- ============================================
-- Migration 0018: wishlists
-- ============================================

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlists
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert into their own wishlist
CREATE POLICY "Users can insert own wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlist
CREATE POLICY "Users can update own wishlist"
  ON wishlists FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete from their own wishlist
CREATE POLICY "Users can delete own wishlist"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can view all wishlists
CREATE POLICY "Admin can view all wishlists"
  ON wishlists FOR SELECT
  USING (is_admin());
