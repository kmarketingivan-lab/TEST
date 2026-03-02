"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { slugify } from "@/lib/utils/slugify";

export async function createBrand(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Il nome è obbligatorio" };

    const slug = String(formData.get("slug") ?? "") || slugify(name);
    const payload = {
      name,
      slug,
      logo_url: formData.get("logo_url") ? String(formData.get("logo_url")) : null,
      website_url: formData.get("website") ? String(formData.get("website")) : null,
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: formData.get("is_active") === "true",
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      logger.error("Failed to create brand", { error: error.message });
      return { error: "Errore nella creazione del marchio" };
    }

    await logAuditEvent(admin.id, "create", "brand", data.id, undefined, payload as Record<string, unknown>);
    revalidatePath("/admin/brands");
    return { success: true };
  } catch (err) {
    logger.error("createBrand error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

export async function updateBrand(
  id: string,
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Il nome è obbligatorio" };

    const slug = String(formData.get("slug") ?? "") || slugify(name);
    const payload = {
      name,
      slug,
      logo_url: formData.get("logo_url") ? String(formData.get("logo_url")) : null,
      website_url: formData.get("website") ? String(formData.get("website")) : null,
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: formData.get("is_active") === "true",
    };

    const supabase = await createClient();
    const { error } = await supabase.from("brands").update(payload).eq("id", id);

    if (error) {
      logger.error("Failed to update brand", { error: error.message });
      return { error: "Errore nell'aggiornamento del marchio" };
    }

    await logAuditEvent(admin.id, "update", "brand", id, undefined, payload as Record<string, unknown>);
    revalidatePath("/admin/brands");
    return { success: true };
  } catch (err) {
    logger.error("updateBrand error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

export async function deleteBrand(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase.from("brands").delete().eq("id", id);

    if (error) {
      logger.error("Failed to delete brand", { error: error.message });
      return { error: "Errore nell'eliminazione del marchio" };
    }

    await logAuditEvent(admin.id, "delete", "brand", id);
    revalidatePath("/admin/brands");
    return { success: true };
  } catch (err) {
    logger.error("deleteBrand error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
