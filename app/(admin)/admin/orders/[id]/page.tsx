import { requireAdmin } from "@/lib/auth/helpers";
import { getOrderById } from "@/lib/dal/orders";
import { Badge, getStatusVariant } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { OrderActions } from "./order-actions";
import { PickupInfo } from "./pickup-info";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const shippingAddress = order.shipping_address as Record<string, string> | null;
  const billingAddress = order.billing_address as Record<string, string> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-500">
            {format(new Date(order.created_at), "dd MMMM yyyy HH:mm", { locale: it })}
          </p>
        </div>
        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Cliente</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Email:</dt><dd className="text-gray-900">{order.email}</dd></div>
            {shippingAddress && (
              <div>
                <dt className="text-gray-500">Indirizzo spedizione:</dt>
                <dd className="text-gray-900">
                  {shippingAddress.street}, {shippingAddress.city} {shippingAddress.zip}
                  {shippingAddress.province ? ` (${shippingAddress.province})` : ""}, {shippingAddress.country}
                </dd>
              </div>
            )}
            {billingAddress && (
              <div>
                <dt className="text-gray-500">Indirizzo fatturazione:</dt>
                <dd className="text-gray-900">
                  {billingAddress.street}, {billingAddress.city} {billingAddress.zip}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order totals */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Riepilogo</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Subtotale:</dt><dd>€{order.subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">IVA:</dt><dd>€{order.tax.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Spedizione:</dt><dd>€{order.shipping.toFixed(2)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between"><dt className="text-gray-500">Sconto:</dt><dd>-€{order.discount.toFixed(2)}</dd></div>}
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <dt>Totale:</dt><dd>€{order.total.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Articoli</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Prodotto</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Quantità</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Prezzo</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Totale</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-900">
                  {item.product_name}
                  {item.variant_name && <span className="text-gray-500"> — {item.variant_name}</span>}
                </td>
                <td className="px-4 py-2 text-right text-gray-900">{item.quantity}</td>
                <td className="px-4 py-2 text-right text-gray-900">€{item.unit_price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right text-gray-900">€{item.total_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pickup compliance info */}
      {order.requires_pickup && (
        <PickupInfo
          orderId={order.id}
          pickupDocumentType={order.pickup_document_type}
          pickupDocumentNumber={order.pickup_document_number}
          pickupDocumentVerified={order.pickup_document_verified ?? false}
        />
      )}

      {/* Actions */}
      <OrderActions orderId={order.id} currentStatus={order.status} notes={order.notes} />
    </div>
  );
}
