import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BrandsTable } from "./brands-table";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default async function AdminBrandsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true });

  // Get product counts per brand
  const { data: productCounts } = await supabase
    .from("products")
    .select("brand_id");

  const countMap = new Map<string, number>();
  for (const row of productCounts ?? []) {
    const brandId = (row as Record<string, unknown>).brand_id as string | null;
    if (brandId) countMap.set(brandId, (countMap.get(brandId) ?? 0) + 1);
  }

  const brandsWithCount = ((brands ?? []) as Brand[]).map((b) => ({
    ...b,
    product_count: countMap.get(b.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Marchi</h1>
        <Link
          href="/admin/brands/new"
          className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nuovo marchio
        </Link>
      </div>
      <BrandsTable brands={brandsWithCount} />
    </div>
  );
}
