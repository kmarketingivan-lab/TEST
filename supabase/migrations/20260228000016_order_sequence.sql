-- ============================================
-- Migration 0016: Atomic order number via sequence
-- ============================================

CREATE SEQUENCE order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 'ORD-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
$$;
