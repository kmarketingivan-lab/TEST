import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    logger.warn("Webhook signature verification failed", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      logger.info("Checkout session expired", { sessionId: session.id });
      break;
    }
    case "charge.refunded": {
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    }
    default:
      logger.info("Unhandled webhook event", { type: event.type });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    // Retrieve session with line items expanded
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });

    const supabase = createAdminClient();
    const userId = fullSession.metadata?.user_id || null;
    const paymentIntentId = fullSession.payment_intent as string | null;

    // --- IDEMPOTENCY CHECK ---
    if (paymentIntentId) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, order_number")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();

      if (existingOrder) {
        logger.info("Webhook: duplicate event, order already exists", {
          orderNumber: existingOrder.order_number,
          paymentIntentId,
          sessionId: session.id,
        });
        return;
      }
    }

    // --- PARSE CART_HASH FOR PRODUCT IDS ---
    const cartHash = fullSession.metadata?.cart_hash;
    let cartEntries: Array<{ productId: string; variantId: string | null; qty: number }> = [];
    if (cartHash) {
      try {
        const raw = JSON.parse(cartHash) as string[];
        cartEntries = raw
          .map((entry) => {
            const parts = entry.split(":");
            const productId = parts[0] ?? "";
            const variantId = parts[1] ?? null;
            const qtyStr = parts[2] ?? "0";
            return {
              productId,
              variantId: variantId || null,
              qty: parseInt(qtyStr, 10) || 0,
            };
          })
          .filter((e) => e.productId && e.qty > 0);
      } catch {
        logger.warn("Webhook: failed to parse cart_hash", { sessionId: session.id });
      }
    }

    // Build shipping address: prefer metadata (form-collected), fall back to Stripe-collected
    let shippingAddress: { street: string; city: string; zip: string; province: string | null; country: string };
    const shippingAddrJson = fullSession.metadata?.shipping_address_json;
    if (shippingAddrJson) {
      try {
        shippingAddress = JSON.parse(shippingAddrJson) as typeof shippingAddress;
      } catch {
        shippingAddress = { street: "", city: "", zip: "", province: null, country: "IT" };
      }
    } else {
      const shippingDetails = fullSession.collected_information?.shipping_details;
      shippingAddress = shippingDetails?.address
        ? {
            street: shippingDetails.address.line1 ?? "",
            city: shippingDetails.address.city ?? "",
            zip: shippingDetails.address.postal_code ?? "",
            province: shippingDetails.address.state ?? null,
            country: shippingDetails.address.country ?? "IT",
          }
        : { street: "", city: "", zip: "", province: null, country: "IT" };
    }

    // Billing address from metadata or fallback to shipping
    let billingAddress = shippingAddress;
    const billingAddrJson = fullSession.metadata?.billing_address_json;
    if (billingAddrJson) {
      try {
        billingAddress = JSON.parse(billingAddrJson) as typeof billingAddress;
      } catch { /* fall through */ }
    }

    // Compliance fields
    const requiresPickup = fullSession.metadata?.requires_pickup === "true";
    const pickupDocType = fullSession.metadata?.pickup_document_type || null;
    const pickupDocNumber = fullSession.metadata?.pickup_document_number || null;

    // Customer info from metadata (form) or Stripe
    const customerEmail =
      fullSession.metadata?.customer_email || fullSession.customer_details?.email || "";
    const customerNotes = fullSession.metadata?.notes || null;

    // Calculate totals from Stripe (amounts are in cents)
    const total = (fullSession.amount_total ?? 0) / 100;
    const subtotal = (fullSession.amount_subtotal ?? 0) / 100;
    const discount = fullSession.total_details?.amount_discount
      ? fullSession.total_details.amount_discount / 100
      : 0;
    const tax = Math.max(0, total - subtotal + discount);

    // Build order items with product IDs from cart_hash
    const lineItems = fullSession.line_items?.data ?? [];
    const productLineItems = lineItems.filter((li) => li.description !== "Spedizione");
    const orderItems = productLineItems.map((li, index) => {
      const cartEntry = cartEntries[index];
      return {
        product_id: cartEntry?.productId ?? null,
        variant_id: cartEntry?.variantId ?? null,
        product_name: li.description ?? "Prodotto",
        variant_name: null,
        quantity: li.quantity ?? 1,
        unit_price: (li.price?.unit_amount ?? 0) / 100,
        total_price: (li.amount_total ?? 0) / 100,
      };
    });

    // --- ATOMIC ORDER CREATION ---
    const rpcParams = {
      user_id: userId || null,
      email: customerEmail,
      status: "confirmed",
      subtotal,
      tax,
      shipping: 0,
      discount,
      total,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      notes: customerNotes,
      stripe_payment_intent_id: paymentIntentId,
      coupon_id: null,
      coupon_code: fullSession.metadata?.coupon_code || null,
      coupon_discount: discount,
      items: orderItems,
    };

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "create_order_atomic",
      { p_params: rpcParams }
    );

    if (rpcError) {
      // Unique constraint violation = duplicate payment_intent (idempotency fallback)
      if (rpcError.message?.includes("duplicate") || rpcError.code === "23505") {
        logger.info("Webhook: duplicate payment intent caught by DB constraint", {
          paymentIntentId,
          sessionId: session.id,
        });
        return;
      }
      logger.error("Webhook: atomic order creation failed", {
        error: rpcError.message,
        sessionId: session.id,
      });
      return;
    }

    const result = rpcResult as { order_id: string; order_number: string };
    const orderId = result.order_id;
    const orderNumber = result.order_number;

    // Save compliance fields if firearms/pickup order
    if (requiresPickup) {
      await supabase
        .from("orders")
        .update({
          requires_pickup: true,
          pickup_document_type: pickupDocType,
          pickup_document_number: pickupDocNumber,
        })
        .eq("id", orderId);
    }

    // Build a shared order object for emails
    const orderForEmail = {
      ...rpcParams,
      id: orderId,
      order_number: orderNumber,
      requires_pickup: requiresPickup,
      pickup_document_type: pickupDocType,
      pickup_document_number: pickupDocNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const itemsForEmail = orderItems.map((oi) => ({
      ...oi,
      id: "",
      order_id: orderId,
      created_at: new Date().toISOString(),
    }));
    const customerName = fullSession.metadata?.customer_name || fullSession.customer_details?.name || "";
    const customerPhone = fullSession.metadata?.customer_phone || "";

    // Send order confirmation to customer
    try {
      const { sendOrderConfirmation } = await import("@/lib/email/send");
      await sendOrderConfirmation(
        orderForEmail as unknown as Parameters<typeof sendOrderConfirmation>[0],
        itemsForEmail as Parameters<typeof sendOrderConfirmation>[1],
        { email: customerEmail, name: customerName }
      );
    } catch {
      // Email service not available or failed, continue
    }

    // Send notification to store owner
    try {
      const ownerEmail = process.env.OWNER_EMAIL;
      if (ownerEmail) {
        const { sendOwnerNotification } = await import("@/lib/email/send");
        await sendOwnerNotification(
          orderForEmail as unknown as Parameters<typeof sendOwnerNotification>[0],
          itemsForEmail as Parameters<typeof sendOwnerNotification>[1],
          ownerEmail,
          customerName,
          customerPhone || undefined
        );
      }
    } catch {
      // Non-critical
    }

    // Send WhatsApp notification to store owner
    try {
      const { sendWhatsAppNotification } = await import("@/lib/notifications/whatsapp");
      const city = (shippingAddress as { city?: string }).city ?? "";
      const waMessage = requiresPickup
        ? `🔫 Nuovo ordine #${orderNumber} — RITIRO IN NEGOZIO\nCliente: ${customerName}\nTel: ${customerPhone}\nDocumento: ${pickupDocType ?? "—"}\nTotale: €${total.toFixed(2)}`
        : `🛍️ Nuovo ordine #${orderNumber}\nCliente: ${customerName}\nCittà: ${city}\nTotale: €${total.toFixed(2)}`;
      await sendWhatsAppNotification(waMessage);
    } catch {
      // Non-critical
    }

    // Audit log
    await logAuditEvent(userId, "create", "order", orderId, undefined, {
      order_number: orderNumber,
      total,
      stripe_session_id: fullSession.id,
    });

    logger.info("Webhook: order created from Stripe", {
      orderNumber,
      sessionId: session.id,
    });
  } catch (err) {
    logger.error("Webhook: handleCheckoutCompleted error", {
      error: err instanceof Error ? err.message : "Unknown",
      sessionId: session.id,
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const supabase = createAdminClient();
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id ?? null;

    if (!paymentIntentId) {
      logger.warn("Webhook: charge.refunded missing payment_intent", {
        chargeId: charge.id,
      });
      return;
    }

    // Look up order by stripe_payment_intent_id
    const { data: order, error: lookupError } = await supabase
      .from("orders")
      .select("id, order_number, status, user_id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (lookupError || !order) {
      logger.warn("Webhook: no order found for refunded payment_intent", {
        paymentIntentId,
        chargeId: charge.id,
        error: lookupError?.message,
      });
      return;
    }

    // Full refund: update status. Partial: only audit log.
    const isFullRefund = charge.amount_captured === charge.amount_refunded;

    if (isFullRefund) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("id", order.id);

      if (updateError) {
        logger.error("Webhook: failed to update order status to refunded", {
          orderId: order.id,
          error: updateError.message,
        });
        return;
      }
    }

    // Audit log
    await logAuditEvent(
      order.user_id,
      "refund",
      "order",
      order.id as string,
      { status: order.status },
      {
        status: isFullRefund ? "refunded" : order.status,
        charge_id: charge.id,
        amount_refunded: charge.amount_refunded / 100,
        is_full_refund: isFullRefund,
      }
    );

    logger.info("Webhook: charge refunded processed", {
      orderNumber: order.order_number,
      chargeId: charge.id,
      isFullRefund,
    });
  } catch (err) {
    logger.error("Webhook: handleChargeRefunded error", {
      error: err instanceof Error ? err.message : "Unknown",
      chargeId: charge.id,
    });
  }
}
