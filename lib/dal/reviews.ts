import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/types/database";

interface PaginatedReviews {
  data: Review[];
  count: number;
}

interface ReviewStats {
  avg: number;
  count: number;
  distribution: Record<number, number>;
}

/**
 * Get approved reviews for a product with pagination.
 */
export async function getProductReviews(
  productId: string,
  options: { page?: number; perPage?: number } = {}
): Promise<PaginatedReviews> {
  const { page = 1, perPage = 10 } = options;
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as Review[],
    count: count ?? 0,
  };
}

/**
 * Get average rating for a product.
 */
export async function getAverageRating(productId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const sum = data.reduce((acc, r) => acc + (r as Review).rating, 0);
  return Math.round((sum / data.length) * 10) / 10;
}

/**
 * Get review statistics for a product: avg, count, and 1-5 distribution.
 */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (error) throw error;

  const reviews = (data ?? []) as Review[];
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const r of reviews) {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  }

  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

  return { avg, count, distribution };
}

/**
 * Create a new review.
 */
export async function createReview(review: {
  product_id: string;
  user_id?: string;
  author_name: string;
  rating: number;
  title?: string;
  body?: string;
}): Promise<Review> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

/**
 * Approve a review (admin).
 */
export async function approveReview(reviewId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", reviewId);

  if (error) throw error;
}

/**
 * Delete a review (admin).
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;
}
