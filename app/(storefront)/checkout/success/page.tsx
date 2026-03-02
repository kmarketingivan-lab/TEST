import { redirect } from "next/navigation";
import Link from "next/link";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { ClearCart } from "./clear-cart";
import type { Order, OrderItem } from "@/types/database";

interface SuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = typeof params["session_id"] === "string" ? params["session_id"] : null;
  const orderNumberParam = typeof params["order"] === "string" ? params["order"] : null;

  // If neither session_id nor order number, redirect home
  if (!sessionId && !orderNumberParam) {
    redirect("/");
  }

  let stripeEmail: string | null = null;
  let isStripePayment = false;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      stripeEmail = session.customer_details?.email ?? null;
      isStripePayment = true;
    } catch {
      redirect("/");
    }
  }

  // Fetch the order details from DB
  let order: (Order & { order_items: OrderItem[] }) | null = null;

  if (orderNumberParam) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumberParam)
      .single();

    if (data) {
      order = data as Order & { order_items: OrderItem[] };
    }
  }

  const user = await getCurrentUser();

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  const shippingAddr = order?.shipping_address as { street?: string; city?: string; zip?: string; province?: string; country?: string } | null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <ClearCart />

      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Ordine confermato!</h1>

        {(orderNumberParam ?? order?.order_number) && (
          <p className="mt-3 text-lg text-gray-600">
            Numero ordine: <span className="font-semibold text-gray-900">{orderNumberParam ?? order?.order_number}</span>
          </p>
        )}

        {(stripeEmail ?? order?.email) && (
          <p className="mt-2 text-gray-600">
            Riceverai email di conferma a <span className="font-semibold">{stripeEmail ?? order?.email}</span>
          </p>
        )}

        <p className="mt-2 text-gray-500">
          {isStripePayment
            ? "Il pagamento è stato ricevuto."
            : "Il pagamento verrà gestito separatamente."}
        </p>
      </div>

      {/* Order summary */}
      {order && (
        <div className="mt-10 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Riepilogo ordine</h2>

          {/* Items */}
          <div className="mt-4 divide-y divide-gray-100">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <span className="text-gray-900">{item.product_name}</span>
                  {item.variant_name && (
                    <span className="ml-1 text-gray-500">({item.variant_name})</span>
                  )}
                  <span className="ml-2 text-gray-400">&times;{item.quantity}</span>
                </div>
                <span className="font-medium text-gray-900">{formatPrice(item.total_price)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotale</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Sconto</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>IVA</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Spedizione</span>
              <span>{order.shipping > 0 ? formatPrice(order.shipping) : "Gratuita"}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900">
              <span>Totale</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {shippingAddr && shippingAddr.street && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900">Indirizzo di spedizione</h3>
              <p className="mt-1 text-sm text-gray-600">
                {shippingAddr.street}<br />
                {shippingAddr.zip} {shippingAddr.city}
                {shippingAddr.province ? ` (${shippingAddr.province})` : ""}<br />
                {shippingAddr.country}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div className="mt-8 flex justify-center gap-4">
        {user ? (
          <Link
            href="/account/orders"
            className="rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800"
          >
            Vedi i tuoi ordini
          </Link>
        ) : (
          <Link
            href="/"
            className="rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800"
          >
            Torna alla home
          </Link>
        )}
        <Link
          href="/products"
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Torna al catalogo
        </Link>
      </div>
    </div>
  );
}
