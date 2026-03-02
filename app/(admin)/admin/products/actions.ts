"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { productSchema } from "@/lib/validators/products";
import { slugify } from "@/lib/utils/slugify";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { stripUndefined } from "@/lib/utils/supabase-helpers";
import { sanitizeHtml } from "@/lib/utils/sanitize";

/**
 * Create a new product.
 * @param formData - Product form data
 * @returns Success or error result
 */
export async function createProduct(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();

    const raw = {
      name: formData.get("name"),
      slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
      description: formData.get("description") || null,
      rich_description: formData.get("rich_description") ? sanitizeHtml(String(formData.get("rich_description"))) : null,
      price: Number(formData.get("price")),
      compare_at_price: formData.get("compare_at_price")
        ? Number(formData.get("compare_at_price"))
        : null,
      cost_price: formData.get("cost_price")
        ? Number(formData.get("cost_price"))
        : null,
      sku: formData.get("sku") || null,
      barcode: formData.get("barcode") || null,
      stock_quantity: Number(formData.get("stock_quantity") ?? 0),
      low_stock_threshold: Number(formData.get("low_stock_threshold") ?? 5),
      weight_grams: formData.get("weight_grams")
        ? Number(formData.get("weight_grams"))
        : null,
      category_id: formData.get("category_id") || null,
      is_active: formData.get("is_active") === "true",
      is_featured: formData.get("is_featured") === "true",
      seo_title: formData.get("seo_title") || null,
      seo_description: formData.get("seo_description") || null,
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    // H12: Extra fields (specifications, regulatory_info, brand_id)
    const extra: Record<string, unknown> = {};
    const specsStr = formData.get("specifications");
    if (specsStr) {
      try { extra.specifications = JSON.parse(String(specsStr)); } catch { /* skip */ }
    }
    if (formData.has("regulatory_info")) extra.regulatory_info = formData.get("regulatory_info") || null;
    if (formData.get("brand_id")) extra.brand_id = formData.get("brand_id");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({ ...stripUndefined(parsed.data), ...extra })
      .select("id")
      .single();

    if (error) {
      logger.error("Failed to create product", { error: error.message });
      return { error: "Errore nella creazione del prodotto" };
    }

    await logAuditEvent(admin.id, "create", "product", data.id, undefined, parsed.data as Record<string, unknown>);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("createProduct error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Update an existing product.
 * @param id - Product ID
 * @param formData - Updated product form data
 * @returns Success or error result
 */
export async function updateProduct(
  id: string,
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();

    const raw = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description") || null,
      rich_description: formData.get("rich_description") ? sanitizeHtml(String(formData.get("rich_description"))) : null,
      price: Number(formData.get("price")),
      compare_at_price: formData.get("compare_at_price")
        ? Number(formData.get("compare_at_price"))
        : null,
      cost_price: formData.get("cost_price")
        ? Number(formData.get("cost_price"))
        : null,
      sku: formData.get("sku") || null,
      barcode: formData.get("barcode") || null,
      stock_quantity: Number(formData.get("stock_quantity") ?? 0),
      low_stock_threshold: Number(formData.get("low_stock_threshold") ?? 5),
      weight_grams: formData.get("weight_grams")
        ? Number(formData.get("weight_grams"))
        : null,
      category_id: formData.get("category_id") || null,
      is_active: formData.get("is_active") === "true",
      is_featured: formData.get("is_featured") === "true",
      seo_title: formData.get("seo_title") || null,
      seo_description: formData.get("seo_description") || null,
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    // H12: Extra fields (specifications, regulatory_info, brand_id)
    const extra: Record<string, unknown> = {};
    const specsStr = formData.get("specifications");
    if (specsStr) {
      try { extra.specifications = JSON.parse(String(specsStr)); } catch { /* skip */ }
    }
    if (formData.has("regulatory_info")) extra.regulatory_info = formData.get("regulatory_info") || null;
    if (formData.has("brand_id")) extra.brand_id = formData.get("brand_id") || null;

    const supabase = await createClient();

    // Get old values for audit diff
    const { data: oldProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("products")
      .update({ ...stripUndefined(parsed.data), ...extra })
      .eq("id", id);

    if (error) {
      logger.error("Failed to update product", { error: error.message });
      return { error: "Errore nell'aggiornamento del prodotto" };
    }

    await logAuditEvent(
      admin.id,
      "update",
      "product",
      id,
      oldProduct as Record<string, unknown> | undefined,
      parsed.data as Record<string, unknown>
    );
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("updateProduct error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Soft-delete a product by setting is_active to false.
 * @param id - Product ID
 * @returns Success or error result
 */
export async function deleteProduct(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      logger.error("Failed to delete product", { error: error.message });
      return { error: "Errore nell'eliminazione del prodotto" };
    }

    await logAuditEvent(admin.id, "soft_delete", "product", id);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("deleteProduct error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Toggle product active status.
 * @param id - Product ID
 * @returns Success or error result
 */
export async function toggleProductActive(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { data: product } = await supabase
      .from("products")
      .select("is_active")
      .eq("id", id)
      .single();

    if (!product) {
      return { error: "Prodotto non trovato" };
    }

    const newActive = !product.is_active;
    const { error } = await supabase
      .from("products")
      .update({ is_active: newActive })
      .eq("id", id);

    if (error) {
      return { error: "Errore nel cambio stato" };
    }

    await logAuditEvent(admin.id, "toggle_active", "product", id, { is_active: product.is_active }, { is_active: newActive });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("toggleProductActive error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Update product stock quantity.
 * @param id - Product ID
 * @param quantity - New stock quantity
 * @returns Success or error result
 */
export async function updateProductStock(
  id: string,
  quantity: number
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();

    if (!Number.isInteger(quantity) || quantity < 0) {
      return { error: "La quantità deve essere un intero non negativo" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: quantity })
      .eq("id", id);

    if (error) {
      return { error: "Errore nell'aggiornamento dello stock" };
    }

    await logAuditEvent(admin.id, "update_stock", "product", id, undefined, { stock_quantity: quantity });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("updateProductStock error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Reorder product images.
 * @param productId - Product ID
 * @param imageIds - Array of image IDs in desired order
 * @returns Success or error result
 */
export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const updates = imageIds.map((imageId, index) =>
      supabase
        .from("product_images")
        .update({ sort_order: index })
        .eq("id", imageId)
        .eq("product_id", productId)
    );

    const results = await Promise.all(updates);
    const hasError = results.find((r) => r.error);

    if (hasError) {
      return { error: "Errore nel riordinamento delle immagini" };
    }

    await logAuditEvent(admin.id, "reorder_images", "product", productId, undefined, { image_order: imageIds });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("reorderProductImages error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Bulk update products (activate/deactivate).
 */
export async function bulkUpdateProducts(
  ids: string[],
  isActive: boolean
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive })
      .in("id", ids);

    if (error) {
      logger.error("Failed to bulk update products", { error: error.message });
      return { error: "Errore nell'aggiornamento massivo" };
    }

    await logAuditEvent(admin.id, "bulk_update", "products", "bulk", undefined, { ids, is_active: isActive });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("bulkUpdateProducts error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Bulk delete products (soft delete).
 */
export async function bulkDeleteProducts(
  ids: string[]
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .in("id", ids);

    if (error) {
      logger.error("Failed to bulk delete products", { error: error.message });
      return { error: "Errore nell'eliminazione massiva" };
    }

    await logAuditEvent(admin.id, "bulk_delete", "products", "bulk", undefined, { ids });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err) {
    logger.error("bulkDeleteProducts error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
