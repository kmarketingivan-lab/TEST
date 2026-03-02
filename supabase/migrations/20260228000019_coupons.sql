-- ============================================
-- Migration 0019: coupons
-- ============================================

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- ============================================
-- RPC: validate_and_apply_coupon
-- ============================================
CREATE OR REPLACE FUNCTION validate_and_apply_coupon(p_code TEXT, p_order_amount NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_discount NUMERIC;
BEGIN
  SELECT * INTO v_coupon FROM coupons
    WHERE code = UPPER(TRIM(p_code))
      AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'reason', 'Coupon non trovato');
  END IF;

  -- Check dates
  IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'reason', 'Coupon non ancora attivo');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND now() > v_coupon.expires_at THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'reason', 'Coupon scaduto');
  END IF;

  -- Check max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'reason', 'Coupon esaurito');
  END IF;

  -- Check min order amount
  IF p_order_amount < v_coupon.min_order_amount THEN
    RETURN jsonb_build_object('valid', false, 'discount', 0, 'reason',
      format('Ordine minimo: %s EUR', v_coupon.min_order_amount));
  END IF;

  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := ROUND(p_order_amount * v_coupon.discount_value / 100, 2);
  ELSE
    v_discount := LEAST(v_coupon.discount_value, p_order_amount);
  END IF;

  RETURN jsonb_build_object('valid', true, 'discount', v_discount, 'reason', NULL,
    'coupon_id', v_coupon.id, 'code', v_coupon.code);
END;
$$;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public can view active coupons within dates
CREATE POLICY "Public can view active coupons"
  ON coupons FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR now() >= starts_at)
    AND (expires_at IS NULL OR now() <= expires_at)
  );

-- Admin CRUD
CREATE POLICY "Admin can view all coupons" ON coupons FOR SELECT USING (is_admin());
CREATE POLICY "Admin can insert coupons" ON coupons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update coupons" ON coupons FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete coupons" ON coupons FOR DELETE USING (is_admin());
