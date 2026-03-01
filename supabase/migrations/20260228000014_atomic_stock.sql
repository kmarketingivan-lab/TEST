-- ============================================
-- Migration 0014: Atomic stock decrement RPC
-- ============================================

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO current_stock
  FROM products WHERE id = p_product_id FOR UPDATE;

  IF current_stock IS NULL THEN
    RETURN FALSE;
  END IF;

  IF current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE products SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$;
