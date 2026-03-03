"use server";

import { createClient } from "@/lib/supabase/server";
import { getCart, clearCart, calculateTotals } from "@/lib/cart/cart";
import { orderSchema } from "@/lib/validators/orders";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { getCurrentUser } from "@/lib/auth/helpers";
import { rateLimitByIp } from "@/lib/utils/rate-limit";

/**
 * Create an order from the current cart.
 * Uses the atomic create_order_atomic RPC which handles:
 * order insert + items insert + stock decrement in one transaction.
 *
 * NOTE: This function is for admin/manual orders only.
 * Storefront checkouts go through /api/stripe/checkout → Stripe webhook.
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

    // 2b. Validate shipping country (only IT)
    const shippingCountryRaw = formData.get("shipping_country") as string | null;
    if (shippingCountryRaw && shippingCountryRaw.toUpperCase() !== "IT") {
      return { error: "Le spedizioni sono disponibili solo in Italia" };
    }

    // 2c. Detect firearms in cart (fail-open: if query fails, no pickup required)
    const supabase = await createClient();
    let requiresPickup = false;
    try {
      const productIds = [...new Set(cartItems.map((i) => i.productId))];
      const { data: cartProducts } = await supabase
        .from("products")
        .select("id, product_type")
        .in("id", productIds);
      requiresPickup = cartProducts?.some(
        (p) => p.product_type === "arma_fuoco" || p.product_type === "munizioni"
      ) ?? false;
    } catch {
      // Non-critical check; default to no pickup requirement
    }

    // 3. Calculate totals from DB (fresh prices) with coupon and shipping country
    const couponCode = formData.get("coupon_code") as string | null;
    const shippingCountry = (formData.get("shipping_country") as string) || "IT";
    const totals = await calculateTotals(cartItems, couponCode, shippingCountry);
    if (totals.items.length === 0) {
      return { error: "I prodotti nel carrello non sono più disponibili" };
    }

    const currentUser = await getCurrentUser();
    const discount = totals.discount ?? 0;

    // 4. Build items for atomic RPC
    const orderItems = totals.items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      variant_name: null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.total,
    }));

    // 5. Atomic order creation (order + items + stock decrement in one transaction)
    const rpcParams = {
      user_id: currentUser?.id ?? null,
      email: parsed.data.email,
      status: "pending",
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      discount,
      total: totals.total,
      shipping_address: parsed.data.shipping_address,
      billing_address: parsed.data.billing_address ?? parsed.data.shipping_address,
      notes: parsed.data.notes ?? null,
      stripe_payment_intent_id: null,
      coupon_id: null,
      coupon_code: totals.couponCode ?? null,
      coupon_discount: discount,
      items: orderItems,
    };

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "create_order_atomic",
      { p_params: rpcParams }
    );

    if (rpcError) {
      logger.error("Atomic order creation failed", { error: rpcError.message });
      if (rpcError.message?.includes("Insufficient stock")) {
        return { error: "Uno o più prodotti non hanno stock sufficiente" };
      }
      if (rpcError.message?.includes("not found")) {
        return { error: "Uno o più prodotti non sono più disponibili" };
      }
      return { error: "Errore nella creazione dell'ordine" };
    }

    const result = rpcResult as { order_id: string; order_number: string };
    const orderNumber = result.order_number;
    const orderId = result.order_id;

    // 5b. Save compliance fields if firearms order
    if (requiresPickup) {
      const pickupDocType = formData.get("pickup_document_type") as string | null;
      const pickupDocNumber = formData.get("pickup_document_number") as string | null;
      await supabase
        .from("orders")
        .update({
          requires_pickup: true,
          pickup_document_type: pickupDocType,
          pickup_document_number: pickupDocNumber,
        })
        .eq("id", orderId);
    }

    // 6. Clear cart
    await clearCart();

    // 7. Audit log
    if (currentUser) {
      await logAuditEvent(currentUser.id, "create", "order", orderId, undefined, {
        order_number: orderNumber,
        total: totals.total,
        coupon: totals.couponCode ?? null,
      });
    }

    // 8. Return success
    return { success: true, orderNumber };
  } catch (err) {
    logger.error("createOrder error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
