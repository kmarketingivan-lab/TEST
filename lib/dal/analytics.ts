import { createClient } from "@/lib/supabase/server";

interface RevenueByDay {
  date: string;
  revenue: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

/**
 * Get daily revenue for the last N days.
 */
export async function getRevenueByDay(days = 30): Promise<RevenueByDay[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("orders")
    .select("created_at, total")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const day = (row as { created_at: string }).created_at.slice(0, 10);
    const total = (row as { total: number }).total;
    map.set(day, (map.get(day) ?? 0) + total);
  }

  // Fill in missing days with 0
  const result: RevenueByDay[] = [];
  const cursor = new Date(since);
  const today = new Date();
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({ date: key, revenue: map.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

/**
 * Get order counts grouped by status.
 */
export async function getOrdersByStatus(): Promise<OrdersByStatus[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("status");

  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const s = (row as { status: string }).status;
    map.set(s, (map.get(s) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

/**
 * Get top selling products by quantity.
 */
export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_items")
    .select("product_name, quantity, total_price");

  if (error) throw error;

  const map = new Map<string, { total_quantity: number; total_revenue: number }>();
  for (const row of data ?? []) {
    const r = row as { product_name: string; quantity: number; total_price: number };
    const existing = map.get(r.product_name) ?? { total_quantity: 0, total_revenue: 0 };
    existing.total_quantity += r.quantity;
    existing.total_revenue += r.total_price;
    map.set(r.product_name, existing);
  }

  return Array.from(map.entries())
    .map(([product_name, stats]) => ({ product_name, ...stats }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, limit);
}
