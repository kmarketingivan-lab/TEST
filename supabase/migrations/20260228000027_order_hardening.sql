-- Sprint 1: Backend Hardening
-- 1A: Partial unique index for webhook idempotency
-- 1B: Atomic order creation RPC (order + items + stock in one transaction)

-- ============================================================
-- 1A: Prevent duplicate orders from Stripe webhook replays
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_pi_unique
  ON orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- ============================================================
-- 1B: Atomic order creation function
-- Creates order, inserts items, decrements stock in one transaction.
-- Any failure (e.g. insufficient stock) rolls back everything.
-- ============================================================
CREATE OR REPLACE FUNCTION create_order_atomic(p_params JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_quantity INTEGER;
  v_current_stock INTEGER;
BEGIN
  -- 1. Generate order number atomically
  v_order_number := generate_order_number();

  -- 2. Insert order
  INSERT INTO orders (
    order_number,
    user_id,
    email,
    status,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    shipping_address,
    billing_address,
    notes,
    stripe_payment_intent_id,
    coupon_id,
    coupon_code,
    coupon_discount
  ) VALUES (
    v_order_number,
    (p_params->>'user_id')::UUID,
    p_params->>'email',
    COALESCE(p_params->>'status', 'pending'),
    (p_params->>'subtotal')::NUMERIC,
    COALESCE((p_params->>'tax')::NUMERIC, 0),
    COALESCE((p_params->>'shipping')::NUMERIC, 0),
    COALESCE((p_params->>'discount')::NUMERIC, 0),
    (p_params->>'total')::NUMERIC,
    p_params->'shipping_address',
    p_params->'billing_address',
    p_params->>'notes',
    p_params->>'stripe_payment_intent_id',
    (p_params->>'coupon_id')::UUID,
    p_params->>'coupon_code',
    COALESCE((p_params->>'coupon_discount')::NUMERIC, 0)
  )
  RETURNING id INTO v_order_id;

  -- 3. Insert order items and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_params->'items')
  LOOP
    -- Insert order item
    INSERT INTO order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'variant_id')::UUID,
      v_item->>'product_name',
      v_item->>'variant_name',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'total_price')::NUMERIC
    );

    -- Decrement stock with row-level lock
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;

    IF v_product_id IS NOT NULL AND v_quantity > 0 THEN
      SELECT stock_quantity INTO v_current_stock
        FROM products
        WHERE id = v_product_id
        FOR UPDATE;

      IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Product % not found', v_product_id;
      END IF;

      IF v_current_stock < v_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %: available %, requested %',
          v_product_id, v_current_stock, v_quantity;
      END IF;

      UPDATE products
        SET stock_quantity = stock_quantity - v_quantity
        WHERE id = v_product_id;
    END IF;
  END LOOP;

  -- 4. Return result
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number
  );
END;
$$;
