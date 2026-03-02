import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("name, sku, price, compare_at_price, stock_quantity, category_id, is_active")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get categories and brands for names
  const { data: categories } = await supabase.from("categories").select("id, name");
  const { data: brands } = await supabase.from("brands").select("id, name");

  const catMap = new Map<string, string>();
  for (const c of categories ?? []) {
    catMap.set((c as { id: string }).id, (c as { name: string }).name);
  }

  const brandMap = new Map<string, string>();
  for (const b of brands ?? []) {
    brandMap.set((b as { id: string }).id, (b as { name: string }).name);
  }

  const rows = (products ?? []) as Record<string, unknown>[];
  const headers = ["name", "sku", "price", "compare_at_price", "stock", "category", "brand", "is_active"];

  const csvRows = rows.map((r) =>
    [
      r.name,
      r.sku ?? "",
      r.price,
      r.compare_at_price ?? "",
      r.stock_quantity,
      catMap.get(r.category_id as string) ?? "",
      brandMap.get(r.brand_id as string) ?? "",
      r.is_active ? "true" : "false",
    ]
      .map((v) => `"${String(v ?? "")}"`)
      .join(",")
  );

  const csvContent = [headers.join(","), ...csvRows].join("\n");
  const filename = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
