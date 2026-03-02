"use server";

import { addToCart, updateQuantity, removeFromCart, clearCart } from "./cart";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { rateLimitByIp } from "@/lib/utils/rate-limit";

/**
 * Validate stock availability for a product/variant.
 */
async function validateStock(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  if (variantId) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("stock_quantity, name")
      .eq("id", variantId)
      .single();

    if (!variant) return { ok: false, error: "Variante non trovata" };
    const v = variant as { stock_quantity: number; name: string };
    if (v.stock_quantity < quantity) {
      return { ok: false, error: `Stock insufficiente per "${v.name}": disponibili ${v.stock_quantity}` };
    }
    return { ok: true };
  }

  const { data: product } = await supabase
    .from("products")
    .select("stock_quantity, name")
    .eq("id", productId)
    .single();

  if (!product) return { ok: false, error: "Prodotto non trovato" };
  const p = product as { stock_quantity: number; name: string };
  if (p.stock_quantity < quantity) {
    return { ok: false, error: `Stock insufficiente per "${p.name}": disponibili ${p.stock_quantity}` };
  }
  return { ok: true };
}

/**
 * Server action to add a product to the cart.
 */
export async function addToCartAction(
  productId: string,
  variantId: string | null,
  quantity: number = 1
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!productId) return { error: "ID prodotto richiesto" };
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return { error: "La quantità deve essere un intero positivo" };
    }

    const { success: allowed } = await rateLimitByIp("cart", "default");
    if (!allowed) {
      return { error: "Troppe richieste. Riprova tra poco." };
    }

    // Validate stock before adding
    const { getCart } = await import("./cart");
    const currentItems = await getCart();
    const existing = currentItems.find(
      (i) => i.productId === productId && i.variantId === variantId
    );
    const totalQty = (existing?.quantity ?? 0) + quantity;

    const stockCheck = await validateStock(productId, variantId, totalQty);
    if (!stockCheck.ok) return { error: stockCheck.error };

    await addToCart(productId, variantId, quantity);
    return { success: true };
  } catch (err) {
    logger.error("addToCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nell'aggiunta al carrello" };
  }
}

/**
 * Server action to update cart item quantity.
 */
export async function updateCartAction(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!productId) return { error: "ID prodotto richiesto" };
    if (quantity < 0 || !Number.isInteger(quantity)) {
      return { error: "La quantità deve essere un intero non negativo" };
    }

    if (quantity > 0) {
      const stockCheck = await validateStock(productId, variantId, quantity);
      if (!stockCheck.ok) return { error: stockCheck.error };
    }

    await updateQuantity(productId, variantId, quantity);
    return { success: true };
  } catch (err) {
    logger.error("updateCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nell'aggiornamento del carrello" };
  }
}

/**
 * Server action to remove a product from the cart.
 */
export async function removeFromCartAction(
  productId: string,
  variantId: string | null
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!productId) return { error: "ID prodotto richiesto" };

    await removeFromCart(productId, variantId);
    return { success: true };
  } catch (err) {
    logger.error("removeFromCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nella rimozione dal carrello" };
  }
}

/**
 * Server action to clear the entire cart.
 */
export async function clearCartAction(): Promise<{ success: boolean } | { error: string }> {
  try {
    await clearCart();
    return { success: true };
  } catch (err) {
    logger.error("clearCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nello svuotamento del carrello" };
  }
}

/**
 * Server action to validate a coupon code.
 */
export async function validateCouponAction(
  code: string
): Promise<{ valid: true; label: string; discountPercent?: number; discountFixed?: number } | { valid: false; error: string }> {
  try {
    if (!code || code.trim().length === 0) {
      return { valid: false, error: "Inserisci un codice coupon" };
    }

    const supabase = await createClient();
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "coupons")
      .single();

    if (!setting) {
      return { valid: false, error: "Codice coupon non valido" };
    }

    const coupons = (setting as { value: unknown }).value as Array<{
      code: string;
      label: string;
      discount_percent?: number;
      discount_fixed?: number;
      active?: boolean;
      min_order?: number;
    }>;

    if (!Array.isArray(coupons)) {
      return { valid: false, error: "Codice coupon non valido" };
    }

    const coupon = coupons.find(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase() && c.active !== false
    );

    if (!coupon) {
      return { valid: false, error: "Codice coupon non valido o scaduto" };
    }

    const result: { valid: true; label: string; discountPercent?: number; discountFixed?: number } = {
      valid: true,
      label: coupon.label,
    };
    if (coupon.discount_percent !== undefined) result.discountPercent = coupon.discount_percent;
    if (coupon.discount_fixed !== undefined) result.discountFixed = coupon.discount_fixed;
    return result;
  } catch (err) {
    logger.error("validateCouponAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { valid: false, error: "Errore nella validazione del coupon" };
  }
}
