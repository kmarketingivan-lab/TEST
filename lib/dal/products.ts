import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

interface GetProductsOptions {
  page?: number;
  perPage?: number;
  categoryId?: string;
  search?: string;
  sortBy?: "name" | "price" | "created_at";
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

interface PaginatedResult {
  data: Product[];
  count: number;
}

/**
 * Get products with pagination, filtering, and sorting.
 * @param options - Filtering and pagination options
 * @returns Paginated product list with total count
 */
export async function getProducts(
  options: GetProductsOptions = {}
): Promise<PaginatedResult> {
  const {
    page = 1,
    perPage = 20,
    categoryId,
    search,
    sortBy = "created_at",
    sortOrder = "desc",
    isActive,
  } = options;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" });

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as Product[],
    count: count ?? 0,
  };
}

/**
 * Get a single product by slug, including images and variants.
 * @param slug - The product slug
 * @returns Product with images and variants, or null
 */
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * Get a single product by ID.
 * @param id - The product UUID
 * @returns Product or null
 */
export async function getProductById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Product;
}

/**
 * Get featured active products.
 * @param limit - Max number of results
 * @returns Array of featured products
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Product[];
}

/**
 * Get related products (same category, excluding current).
 * @param productId - Current product ID to exclude
 * @param categoryId - Category to filter by
 * @param limit - Max number of results
 * @returns Array of related products
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .neq("id", productId)
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as Product[];
}

/**
 * Search products by name/description.
 * @param queryStr - Search query string
 * @param limit - Max results
 * @returns Matching products
 */
export async function searchProducts(
  queryStr: string,
  limit = 10
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .or(`name.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Product[];
}
