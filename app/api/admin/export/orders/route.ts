import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format") ?? "csv";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const status = searchParams.get("status");

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("order_number, created_at, email, status, subtotal, tax, shipping, discount, total")
    .order("created_at", { ascending: false });

  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const headers = ["order_number", "date", "email", "status", "subtotal", "tax", "shipping", "discount", "total"];

  const csvRows = rows.map((r) => {
    const date = (r.created_at as string).slice(0, 10);
    return [
      r.order_number,
      date,
      r.email,
      r.status,
      r.subtotal,
      r.tax,
      r.shipping,
      r.discount,
      r.total,
    ]
      .map((v) => `"${String(v ?? "")}"`)
      .join(",");
  });

  const csvContent = [headers.join(","), ...csvRows].join("\n");

  const filename = `orders_export_${new Date().toISOString().slice(0, 10)}.${format === "excel" ? "csv" : "csv"}`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
