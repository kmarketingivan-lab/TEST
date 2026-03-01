import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { stripUndefined } from "@/lib/utils/supabase-helpers";
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

    // Generate order number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });

    const seq = String((count ?? 0) + 1).padStart(6, "0");
    const orderNumber = `ORD-${year}-${seq}`;

    // Build shipping address from Stripe collected_information
    const shippingDetails = fullSession.collected_information?.shipping_details;
    const shippingAddress = shippingDetails?.address
      ? {
          street: shippingDetails.address.line1 ?? "",
          city: shippingDetails.address.city ?? "",
          zip: shippingDetails.address.postal_code ?? "",
          province: shippingDetails.address.state ?? null,
          country: shippingDetails.address.country ?? "IT",
        }
      : { street: "", city: "", zip: "", province: null, country: "IT" };

    // Calculate totals from Stripe (amounts are in cents)
    const total = (fullSession.amount_total ?? 0) / 100;
    const subtotal = (fullSession.amount_subtotal ?? 0) / 100;
    const tax = total - subtotal;

    // Insert order
    const orderData = stripUndefined({
      order_number: orderNumber,
      user_id: userId || null,
      email: fullSession.customer_details?.email ?? "",
      status: "confirmed" as const,
      subtotal,
      tax,
      shipping: 0,
      discount: 0,
      total,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      notes: null as string | null,
      stripe_session_id: fullSession.id,
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select("id")
      .single();

    if (orderError) {
      logger.error("Webhook: failed to create order", {
        error: orderError.message,
        sessionId: session.id,
      });
      return;
    }

    // Insert order items from Stripe line items
    const lineItems = fullSession.line_items?.data ?? [];
    const orderItems = lineItems.map((li) => ({
      order_id: order.id as string,
      product_id: null as string | null,
      variant_id: null as string | null,
      product_name: li.description ?? "Prodotto",
      variant_name: null as string | null,
      quantity: li.quantity ?? 1,
      unit_price: (li.price?.unit_amount ?? 0) / 100,
      total_price: (li.amount_total ?? 0) / 100,
    }));

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        logger.error("Webhook: failed to insert order items", {
          error: itemsError.message,
          orderId: order.id,
        });
      }
    }

    // Decrement stock — parse cart_hash from metadata
    try {
      const cartHash = fullSession.metadata?.cart_hash;
      if (cartHash) {
        const cartEntries = JSON.parse(cartHash) as string[];
        for (const entry of cartEntries) {
          const [productId, , qtyStr] = entry.split(":");
          if (!productId || !qtyStr) continue;
          const qty = parseInt(qtyStr, 10);
          if (isNaN(qty) || qty <= 0) continue;

          const { data: current } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", productId)
            .single();

          if (current) {
            const c = current as { stock_quantity: number };
            await supabase
              .from("products")
              .update({ stock_quantity: Math.max(0, c.stock_quantity - qty) })
              .eq("id", productId);
          }
        }
      }
    } catch (stockErr) {
      logger.error("Webhook: failed to decrement stock", {
        error: stockErr instanceof Error ? stockErr.message : "Unknown",
        sessionId: session.id,
      });
    }

    // Audit log
    await logAuditEvent(userId, "create", "order", order.id as string, undefined, {
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
