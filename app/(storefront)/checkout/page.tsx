import { redirect } from "next/navigation";
import { getCart, calculateTotals } from "@/lib/cart/cart";
import { getCurrentUser } from "@/lib/auth/helpers";
import { CheckoutForm } from "./checkout-form";
import { CheckoutButton } from "@/components/storefront/checkout-button";

export default async function CheckoutPage() {
  const items = await getCart();

  if (items.length === 0) {
    redirect("/cart");
  }

  const [totals, user] = await Promise.all([
    calculateTotals(items),
    getCurrentUser(),
  ]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <CheckoutForm userEmail={user?.email ?? ""} />
        </div>

        {/* Order summary */}
        <div>
          <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Riepilogo ordine</h2>
            <div className="mt-4 divide-y divide-gray-100">
              {totals.items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? "null"}`} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-700">
                    {item.name} <span className="text-gray-400">&times;{item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-900">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotale</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              {totals.shipping > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Spedizione</span>
                  <span>{formatPrice(totals.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900">
                <span>Totale</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <CheckoutButton />
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">
              Oppure compila il form per un ordine manuale
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
