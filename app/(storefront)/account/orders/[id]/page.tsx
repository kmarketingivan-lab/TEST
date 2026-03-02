import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getOrderById } from "@/lib/dal/orders";
import { Badge, getStatusVariant } from "@/components/ui/badge";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "In attesa",
  confirmed: "Confermato",
  processing: "In lavorazione",
  shipped: "Spedito",
  delivered: "Consegnato",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};

const TIMELINE_STEPS = ["pending", "confirmed", "shipped", "delivered"];

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  // Only the owner or admin can view
  if (order.user_id !== user.id && user.role !== "admin") {
    notFound();
  }

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  const shippingAddr = order.shipping_address as { street?: string; city?: string; zip?: string; province?: string; country?: string } | null;
  const billingAddr = order.billing_address as { street?: string; city?: string; zip?: string; province?: string; country?: string } | null;

  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/account/orders" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Torna agli ordini
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Ordine {order.order_number}</h1>
        <Badge variant={getStatusVariant(order.status)}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-gray-500">{formatDate(order.created_at)}</p>

      {/* Timeline */}
      {!isCancelled && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    } ${isCurrent ? "ring-2 ring-green-300" : ""}`}
                  >
                    {isCompleted ? "\u2713" : idx + 1}
                  </div>
                  <span className={`mt-2 text-xs ${isCompleted ? "font-medium text-gray-900" : "text-gray-400"}`}>
                    {STATUS_LABELS[step] ?? step}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex">
            {TIMELINE_STEPS.slice(1).map((step, idx) => (
              <div
                key={step}
                className={`h-0.5 flex-1 ${
                  currentStepIdx > idx ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Articoli</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-gray-500">{item.variant_name}</p>
                )}
                <p className="text-xs text-gray-400">
                  {formatPrice(item.unit_price)} &times; {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatPrice(item.total_price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-2 text-sm">
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
      </div>

      {/* Addresses */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {shippingAddr && shippingAddr.street && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Indirizzo di spedizione</h3>
            <p className="mt-2 text-sm text-gray-600">
              {shippingAddr.street}<br />
              {shippingAddr.zip} {shippingAddr.city}
              {shippingAddr.province ? ` (${shippingAddr.province})` : ""}<br />
              {shippingAddr.country}
            </p>
          </div>
        )}
        {billingAddr && billingAddr.street && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Indirizzo di fatturazione</h3>
            <p className="mt-2 text-sm text-gray-600">
              {billingAddr.street}<br />
              {billingAddr.zip} {billingAddr.city}
              {billingAddr.province ? ` (${billingAddr.province})` : ""}<br />
              {billingAddr.country}
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Note</h3>
          <p className="mt-2 text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* Download invoice */}
      <div className="mt-6 flex gap-4">
        <a
          href={`/api/invoices/${order.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Scarica fattura PDF
        </a>
      </div>
    </div>
  );
}
