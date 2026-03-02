import { createClient } from "@/lib/supabase/server";
import type { Product, ProductImage, ProductVariant, Brand } from "@/types/database";

/** Product with related images, variants, and brand. */
export type ProductWithRelations = Product & {
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  brands: Brand | null;
};

const PRODUCT_WITH_RELATIONS_SELECT =
  "*, product_images(id,url,alt_text,sort_order,is_primary), brands(id,name,slug,logo_url)";

interface GetProductsOptions {
  page?: number;
  perPage?: number;
  categoryId?: string;
  brandId?: string;
  search?: string;
  sortBy?: "name" | "price" | "created_at";
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
}

interface PaginatedResult {
  data: Product[];
  count: number;
}

/**
 * Get products with pagination, filtering, and sorting.
 * Joins product_images and brands.
 */
export async function getProducts(
  options: GetProductsOptions = {}
): Promise<PaginatedResult> {
  const {
    page = 1,
    perPage = 20,
    categoryId,
    brandId,
    search,
    sortBy = "created_at",
    sortOrder = "desc",
    isActive,
    minPrice,
    maxPrice,
    inStock,
    hasDiscount,
  } = options;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_WITH_RELATIONS_SELECT, { count: "exact" });

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (brandId) {
    query = query.eq("brand_id", brandId);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  if (inStock) {
    query = query.gt("stock_quantity", 0);
  }

  if (hasDiscount) {
    query = query.not("compare_at_price", "is", null);
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as unknown as Product[],
    count: count ?? 0,
  };
}

/**
 * Get a single product by slug, including images, variants, and brand.
 */
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*), brands(id,name,slug,logo_url)")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as unknown as ProductWithRelations;
}

/**
 * Get a single product by ID.
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
 * Get featured active products with images and brands.
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_RELATIONS_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

/**
 * Get newest active products with images.
 */
export async function getNewProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_RELATIONS_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

/**
 * Get related products (same category, excluding current) with images.
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, product_images(id,url,alt_text,sort_order,is_primary)")
    .eq("is_active", true)
    .neq("id", productId)
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

/**
 * Search products by name/description with images.
 */
export async function searchProducts(
  queryStr: string,
  limit = 10
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id,url,alt_text,sort_order,is_primary)")
    .eq("is_active", true)
    .or(`name.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}
