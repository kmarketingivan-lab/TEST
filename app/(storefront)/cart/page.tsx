import Link from "next/link";
import { getCart, calculateTotals } from "@/lib/cart/cart";
import { CartItems } from "./cart-items";

export default async function CartPage() {
  const items = await getCart();
  const totals = await calculateTotals(items);

  if (totals.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Il carrello è vuoto</h1>
        <p className="mt-2 text-gray-500">Inizia a fare acquisti dal nostro catalogo.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800"
        >
          Vai al catalogo
        </Link>
      </div>
    );
  }

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Carrello</h1>

      <div className="mt-8">
        <CartItems items={totals.items} />
      </div>

      {/* Totals */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotale</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {(totals.discount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Sconto{totals.couponLabel ? ` (${totals.couponLabel})` : ""}</span>
              <span>-{formatPrice(totals.discount ?? 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA</span>
            <span>{formatPrice(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Spedizione</span>
            <span>{totals.shipping > 0 ? formatPrice(totals.shipping) : "Gratuita"}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Totale</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
        </div>

        <Link
          href="/checkout"
          className="mt-6 block w-full rounded-full bg-red-700 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-red-800"
        >
          Procedi al checkout
        </Link>
      </div>
    </div>
  );
}
