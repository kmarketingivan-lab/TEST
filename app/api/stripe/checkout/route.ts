import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getCart, calculateTotals } from "@/lib/cart/cart";
import { getCurrentUser } from "@/lib/auth/helpers";
import { headers } from "next/headers";

interface CheckoutBody {
  email?: string;
  customer_name?: string;
  customer_phone?: string | null;
  notes?: string | null;
  coupon_code?: string | null;
  shipping_address?: {
    street: string;
    city: string;
    zip: string;
    province: string | null;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    zip: string;
    province: string | null;
    country: string;
  };
  requires_pickup?: boolean;
  pickup_document_type?: string | null;
  pickup_document_number?: string | null;
}

export async function POST(request: Request) {
  try {
    // Graceful degradation: if key is placeholder, return 503
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.includes("placeholder")
    ) {
      return NextResponse.json(
        { error: "Pagamenti non ancora configurati" },
        { status: 503 }
      );
    }

    // Parse optional JSON body (empty body from CheckoutButton is fine)
    let body: CheckoutBody = {};
    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        body = (await request.json()) as CheckoutBody;
      }
    } catch {
      // No body or invalid JSON — proceed without customer data
    }

    const cartItems = await getCart();
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Il carrello è vuoto" },
        { status: 400 }
      );
    }

    const totals = await calculateTotals(cartItems, body.coupon_code ?? null);
    if (totals.items.length === 0) {
      return NextResponse.json(
        { error: "I prodotti nel carrello non sono più disponibili" },
        { status: 400 }
      );
    }

    // Build line_items from DB-verified prices
    const line_items = totals.items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if > 0
    if (totals.shipping > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Spedizione",
          },
          unit_amount: Math.round(totals.shipping * 100),
        },
        quantity: 1,
      });
    }

    // Get origin from headers
    const headersList = await headers();
    const origin =
      headersList.get("origin") ??
      headersList.get("referer")?.replace(/\/[^/]*$/, "") ??
      "http://localhost:3000";

    const user = await getCurrentUser();

    // Build discount coupon for Stripe if applicable
    const discounts: Array<{ coupon: string }> = [];
    const discount = totals.discount ?? 0;
    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "eur",
        duration: "once",
        name: totals.couponLabel ?? "Sconto",
      });
      discounts.push({ coupon: stripeCoupon.id });
    }

    // Determine email (form > logged-in user)
    const customerEmail = body.email ?? user?.email ?? undefined;

    // Build metadata — all values must be strings, max 500 chars each
    const shippingAddr = body.shipping_address;
    const billingAddr = body.billing_address ?? shippingAddr;
    const metadata: Record<string, string> = {
      user_id: user?.id ?? "",
      coupon_code: totals.couponCode ?? "",
      cart_hash: JSON.stringify(
        cartItems.map((i) => `${i.productId}:${i.variantId ?? ""}:${i.quantity}`)
      ),
      customer_email: body.email ?? "",
      customer_name: (body.customer_name ?? "").slice(0, 500),
      customer_phone: (body.customer_phone ?? "").slice(0, 100),
      notes: (body.notes ?? "").slice(0, 500),
      requires_pickup: body.requires_pickup ? "true" : "false",
      pickup_document_type: (body.pickup_document_type ?? "").slice(0, 100),
      pickup_document_number: (body.pickup_document_number ?? "").slice(0, 100),
    };

    if (shippingAddr) {
      metadata.shipping_address_json = JSON.stringify(shippingAddr).slice(0, 500);
    }
    if (billingAddr) {
      metadata.billing_address_json = JSON.stringify(billingAddr).slice(0, 500);
    }

    // Use Stripe's address collection only if we didn't collect the address ourselves
    const collectShipping = !shippingAddr;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      ...(discounts.length > 0 ? { discounts } : {}),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      ...(collectShipping
        ? { shipping_address_collection: { allowed_countries: ["IT"] } }
        : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      locale: "it",
      metadata,
    });

    return NextResponse.json(
      { sessionId: session.id, url: session.url },
      { status: 200 }
    );
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Errore nella creazione della sessione di pagamento" },
      { status: 500 }
    );
  }
}
