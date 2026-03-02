-- ============================================
-- Migration 0021: newsletter_subscribers
-- ============================================

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(is_active);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (anon/authenticated) can insert (subscribe)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admin can view all subscribers
CREATE POLICY "Admin can view all subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (is_admin());

-- Admin can update subscribers
CREATE POLICY "Admin can update subscribers"
  ON newsletter_subscribers FOR UPDATE
  USING (is_admin());

-- Admin can delete subscribers
CREATE POLICY "Admin can delete subscribers"
  ON newsletter_subscribers FOR DELETE
  USING (is_admin());
