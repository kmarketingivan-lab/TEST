import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Product } from "@/types/database";

interface LowStockAlertProps {
  products: Product[];
}

function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) return null;

  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-800">
          Stock basso ({products.length} prodotti)
        </h3>
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md bg-white px-4 py-2"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-500">
                Stock: {p.stock_quantity} / Soglia: {p.low_stock_threshold ?? 5}
              </p>
            </div>
            <Link
              href={`/admin/products/${p.id}/edit`}
              className="text-sm font-medium text-red-700 hover:text-red-800"
            >
              Modifica
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export { LowStockAlert };
