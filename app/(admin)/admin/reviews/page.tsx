import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { ReviewsTable } from "./reviews-table";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const filter = typeof params.filter === "string" ? params.filter : "all";

  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter === "pending") {
    query = query.eq("is_approved", false);
  } else if (filter === "approved") {
    query = query.eq("is_approved", true);
  }

  const { data: reviews } = await query;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recensioni</h1>
      <ReviewsTable reviews={(reviews ?? []) as ReviewRow[]} currentFilter={filter} />
    </div>
  );
}

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  [key: string]: unknown;
}
