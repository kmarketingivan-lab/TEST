import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShippingTable } from "./shipping-table";

export default async function AdminShippingPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: zones } = await supabase
    .from("shipping_zones")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Zone di spedizione</h1>
        <Link
          href="/admin/shipping/new"
          className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nuova zona
        </Link>
      </div>
      <ShippingTable zones={(zones ?? []) as ShippingRow[]} />
    </div>
  );
}

interface ShippingRow {
  id: string;
  name: string;
  countries: string[];
  flat_rate: number;
  min_order_free_shipping: number | null;
  per_kg_rate: number | null;
  is_active: boolean;
  [key: string]: unknown;
}
