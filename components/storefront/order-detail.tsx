"use client";

import type { Order, OrderItem } from "@/types/database";

interface OrderDetailProps {
  order: Order & { order_items: OrderItem[] };
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

/**
 * Reusable order detail component (client-side).
 * Used for modals, previews, or embedded order views.
 */
function OrderDetail({ order }: OrderDetailProps) {
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="text-sm text-gray-500">
        {new Date(order.created_at).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </div>

      <div className="divide-y divide-gray-100">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 text-sm">
            <span className="text-gray-700">
              {item.product_name} &times;{item.quantity}
            </span>
            <span className="font-medium text-gray-900">{formatPrice(item.total_price)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-2 text-right">
        <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}

export { OrderDetail };
