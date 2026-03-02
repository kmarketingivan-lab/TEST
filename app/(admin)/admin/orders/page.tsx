import { requireAdmin } from "@/lib/auth/helpers";
import { getOrders } from "@/lib/dal/orders";
import { OrdersTable } from "./orders-table";
import { ExportButton } from "@/components/admin/export-button";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = typeof params.status === "string" ? params.status : "";

  const opts: Parameters<typeof getOrders>[0] = { page, perPage: 20 };
  if (status) opts.status = status;

  const result = await getOrders(opts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ordini</h1>
        <ExportButton
          exportUrl="/api/admin/export/orders"
          label="Esporta"
          formats={["csv", "excel"]}
        />
      </div>
      <OrdersTable orders={result.data} totalCount={result.count} page={page} currentStatus={status} />
    </div>
  );
}
