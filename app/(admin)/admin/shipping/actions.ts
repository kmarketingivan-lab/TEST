"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { stripUndefined } from "@/lib/utils/supabase-helpers";

export async function createShippingZone(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Il nome è obbligatorio" };

    const payload = {
      name,
      countries: String(formData.get("countries") ?? "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      flat_rate: formData.get("flat_rate") ? Number(formData.get("flat_rate")) : 0,
      min_order_free_shipping: formData.get("min_order_free_shipping")
        ? Number(formData.get("min_order_free_shipping"))
        : null,
      per_kg_rate: formData.get("per_kg_rate") ? Number(formData.get("per_kg_rate")) : undefined,
      is_active: formData.get("is_active") === "true",
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_zones")
      .insert(stripUndefined(payload))
      .select("id")
      .single();

    if (error) {
      logger.error("Failed to create shipping zone", { error: error.message });
      return { error: "Errore nella creazione della zona di spedizione" };
    }

    await logAuditEvent(admin.id, "create", "shipping_zone", data.id, undefined, payload as Record<string, unknown>);
    revalidatePath("/admin/shipping");
    return { success: true };
  } catch (err) {
    logger.error("createShippingZone error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

export async function updateShippingZone(
  id: string,
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Il nome è obbligatorio" };

    const payload = {
      name,
      countries: String(formData.get("countries") ?? "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      flat_rate: formData.get("flat_rate") ? Number(formData.get("flat_rate")) : 0,
      min_order_free_shipping: formData.get("min_order_free_shipping")
        ? Number(formData.get("min_order_free_shipping"))
        : null,
      per_kg_rate: formData.get("per_kg_rate") ? Number(formData.get("per_kg_rate")) : undefined,
      is_active: formData.get("is_active") === "true",
    };

    const supabase = await createClient();
    const { error } = await supabase.from("shipping_zones").update(stripUndefined(payload)).eq("id", id);

    if (error) {
      logger.error("Failed to update shipping zone", { error: error.message });
      return { error: "Errore nell'aggiornamento della zona" };
    }

    await logAuditEvent(admin.id, "update", "shipping_zone", id, undefined, payload as Record<string, unknown>);
    revalidatePath("/admin/shipping");
    return { success: true };
  } catch (err) {
    logger.error("updateShippingZone error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

export async function deleteShippingZone(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("shipping_zones").delete().eq("id", id);

    if (error) {
      logger.error("Failed to delete shipping zone", { error: error.message });
      return { error: "Errore nell'eliminazione della zona" };
    }

    await logAuditEvent(admin.id, "delete", "shipping_zone", id);
    revalidatePath("/admin/shipping");
    return { success: true };
  } catch (err) {
    logger.error("deleteShippingZone error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
