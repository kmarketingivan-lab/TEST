"use server";

import { createClient } from "@/lib/supabase/server";
import { getCart, clearCart, calculateTotals } from "@/lib/cart/cart";
import { orderSchema } from "@/lib/validators/orders";
import { stripUndefined } from "@/lib/utils/supabase-helpers";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/helpers";
import { rateLimitByIp } from "@/lib/utils/rate-limit";

/**
 * Create an order from the current cart.
 * Steps:
 * 1. Zod validation of shipping/billing info
 * 2. getCart() — verify not empty
 * 3. calculateTotals() — fresh prices from DB
 * 4. Verify stock for every item
 * 5. Generate order_number
 * 6. Insert order + items
 * 7. Decrement stock atomically via RPC
 * 8. clearCart()
 * 9. Return {success, orderNumber} or {error}
 *
 * @param formData - FormData with email, shipping/billing address, notes
 * @returns Success with order number or error
 */
export async function createOrder(
  formData: FormData
): Promise<{ success: boolean; orderNumber: string } | { error: string }> {
  try {
    // 0. Rate limit
    const { success: allowed } = await rateLimitByIp("checkout", "checkout");
    if (!allowed) {
      return { error: "Troppe richieste. Riprova tra poco." };
    }

    // 1. Zod validation
    const raw = {
      email: formData.get("email"),
      shipping_address: {
        street: formData.get("shipping_street"),
        city: formData.get("shipping_city"),
        zip: formData.get("shipping_zip"),
        province: formData.get("shipping_province") || null,
        country: formData.get("shipping_country"),
      },
      billing_address: formData.get("billing_street")
        ? {
            street: formData.get("billing_street"),
            city: formData.get("billing_city"),
            zip: formData.get("billing_zip"),
            province: formData.get("billing_province") || null,
            country: formData.get("billing_country"),
          }
        : null,
      notes: formData.get("notes") || null,
    };

    const parsed = orderSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    // 2. Get cart and verify not empty
    const cartItems = await getCart();
    if (cartItems.length === 0) {
      return { error: "Il carrello è vuoto" };
    }

    // 3. Calculate totals from DB (fresh prices)
    const totals = await calculateTotals(cartItems);
    if (totals.items.length === 0) {
      return { error: "I prodotti nel carrello non sono più disponibili" };
    }

    const supabase = await createClient();

    // 4. Verify stock for every item
    for (const item of totals.items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity, name")
        .eq("id", item.productId)
        .single();

      if (!product) {
        return { error: `Prodotto "${item.name}" non più disponibile` };
      }

      const p = product as { stock_quantity: number; name: string };
      if (p.stock_quantity < item.quantity) {
        return {
          error: `Stock insufficiente per "${p.name}": disponibili ${p.stock_quantity}, richiesti ${item.quantity}`,
        };
      }
    }

    // 5. Generate order number atomically via RPC
    const { data: orderNumber, error: seqError } = await supabase.rpc("generate_order_number");
    if (seqError || !orderNumber) {
      logger.error("Failed to generate order number", { error: seqError?.message });
      return { error: "Errore nella generazione del numero ordine" };
    }

    // Get current user if authenticated
    const currentUser = await getCurrentUser();

    // 6. Insert order
    const orderData = stripUndefined({
      order_number: orderNumber,
      user_id: currentUser?.id ?? null,
      email: parsed.data.email,
      status: "pending" as const,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      discount: 0,
      total: totals.total,
      shipping_address: parsed.data.shipping_address,
      billing_address: parsed.data.billing_address ?? parsed.data.shipping_address,
      notes: parsed.data.notes ?? null,
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select("id")
      .single();

    if (orderError) {
      logger.error("Failed to create order", { error: orderError.message });
      return { error: "Errore nella creazione dell'ordine" };
    }

    // 6b. Insert order items
    const orderItems = totals.items.map((item) => ({
      order_id: order.id as string,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      variant_name: null as string | null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.total,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      logger.error("Failed to insert order items", { error: itemsError.message });
      return { error: "Errore nel salvataggio degli articoli" };
    }

    // 7. Decrement stock atomically via RPC
    for (const item of totals.items) {
      const { data: decremented, error: rpcError } = await supabase
        .rpc("decrement_stock", { p_product_id: item.productId, p_quantity: item.quantity });

      if (rpcError || decremented === false) {
        logger.error("Atomic stock decrement failed", {
          productId: item.productId,
          quantity: item.quantity,
          error: rpcError?.message,
        });
        return { error: `Prodotto "${item.name}" esaurito` };
      }
    }

    // 8. Clear cart
    await clearCart();

    // Audit log
    if (currentUser) {
      await logAuditEvent(currentUser.id, "create", "order", order.id as string, undefined, {
        order_number: orderNumber,
        total: totals.total,
      });
    }

    // 9. Return success
    return { success: true, orderNumber };
  } catch (err) {
    logger.error("createOrder error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
