import { createClient } from "@/lib/supabase/server";
import type { Brand } from "@/types/database";

/**
 * Get brands, optionally filtered by active status.
 */
export async function getBrands(
  options: { isActive?: boolean } = {}
): Promise<Brand[]> {
  const supabase = await createClient();

  let query = supabase
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true });

  if (options.isActive !== undefined) {
    query = query.eq("is_active", options.isActive);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as Brand[];
}

/**
 * Get a brand by slug.
 */
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Brand;
}

/**
 * Create a brand (admin).
 */
export async function createBrand(brand: {
  name: string;
  slug: string;
  logo_url?: string;
  website_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<Brand> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .insert(brand)
    .select()
    .single();

  if (error) throw error;
  return data as Brand;
}

/**
 * Update a brand (admin).
 */
export async function updateBrand(
  brandId: string,
  updates: {
    name?: string;
    slug?: string;
    logo_url?: string;
    website_url?: string;
    sort_order?: number;
    is_active?: boolean;
  }
): Promise<Brand> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .update(updates)
    .eq("id", brandId)
    .select()
    .single();

  if (error) throw error;
  return data as Brand;
}

/**
 * Delete a brand (admin).
 */
export async function deleteBrand(brandId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", brandId);

  if (error) throw error;
}
