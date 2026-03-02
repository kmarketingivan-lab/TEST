import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getOrders } from "@/lib/dal/orders";
import { Badge, getStatusVariant } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  pending: "In attesa",
  confirmed: "Confermato",
  processing: "In lavorazione",
  shipped: "Spedito",
  delivered: "Consegnato",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const page = typeof params["page"] === "string" ? Math.max(1, parseInt(params["page"], 10) || 1) : 1;
  const perPage = 10;

  const { data: orders, count } = await getOrders({
    userId: user.id,
    page,
    perPage,
  });

  const totalPages = Math.ceil(count / perPage);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">I miei ordini</h1>
        <Link href="/account" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Torna al profilo
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Nessun ordine effettuato.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800"
          >
            Vai al catalogo
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Ordine</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Data</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Totale</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Stato</th>
                  <th className="px-4 py-3 font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(order.status)}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-sm font-medium text-red-700 hover:text-red-800"
                      >
                        Dettagli
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/account/orders?page=${page - 1}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Precedente
                </Link>
              )}
              <span className="text-sm text-gray-500">
                Pagina {page} di {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/account/orders?page=${page + 1}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Successiva
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
