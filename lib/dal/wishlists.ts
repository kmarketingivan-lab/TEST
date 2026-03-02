import { createClient } from "@/lib/supabase/server";
import type { Wishlist } from "@/types/database";

interface PaginatedWishlist {
  data: Wishlist[];
  count: number;
}

/**
 * Get a user's wishlist with pagination.
 */
export async function getUserWishlist(
  userId: string,
  options: { page?: number; perPage?: number } = {}
): Promise<PaginatedWishlist> {
  const { page = 1, perPage = 20 } = options;
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("wishlists")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as Wishlist[],
    count: count ?? 0,
  };
}

/**
 * Add a product to the user's wishlist.
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<Wishlist> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();

  if (error) throw error;
  return data as Wishlist;
}

/**
 * Remove a product from the user's wishlist.
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}

/**
 * Check if a product is in the user's wishlist.
 */
export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

/**
 * Get the total number of items in a user's wishlist.
 */
export async function getWishlistCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("wishlists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}
