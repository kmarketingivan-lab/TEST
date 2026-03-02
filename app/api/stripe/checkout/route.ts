import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getCart, calculateTotals } from "@/lib/cart/cart";
import { getCurrentUser } from "@/lib/auth/helpers";
import { headers } from "next/headers";

export async function POST() {
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

    const cartItems = await getCart();
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Il carrello è vuoto" },
        { status: 400 }
      );
    }

    const totals = await calculateTotals(cartItems);
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

    // Pre-fill email if user is logged in
    const user = await getCurrentUser();

    // Build discount coupon for Stripe if applicable
    const discounts: Array<{ coupon: string }> = [];
    const discount = totals.discount ?? 0;
    if (discount > 0) {
      // Create an ad-hoc Stripe coupon for this session
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "eur",
        duration: "once",
        name: totals.couponLabel ?? "Sconto",
      });
      discounts.push({ coupon: stripeCoupon.id });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      ...(discounts.length > 0 ? { discounts } : {}),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      shipping_address_collection: { allowed_countries: ["IT"] },
      ...(user?.email ? { customer_email: user.email } : {}),
      locale: "it",
      metadata: {
        user_id: user?.id ?? "",
        coupon_code: totals.couponCode ?? "",
        cart_hash: JSON.stringify(
          cartItems.map((i) => `${i.productId}:${i.variantId ?? ""}:${i.quantity}`)
        ),
      },
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
