"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { stripUndefined } from "@/lib/utils/supabase-helpers";

export async function createCoupon(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    if (!code) return { error: "Il codice è obbligatorio" };

    const discountType = String(formData.get("discount_type") ?? "percentage");
    const discountValue = Number(formData.get("discount_value") ?? 0);

    if (discountType === "percentage" && discountValue > 100) {
      return { error: "La percentuale non può superare 100" };
    }

    const payload = {
      code,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount: formData.get("min_order_amount") ? Number(formData.get("min_order_amount")) : undefined,
      max_uses: formData.get("max_uses") ? Number(formData.get("max_uses")) : null,
      starts_at: formData.get("starts_at") ? String(formData.get("starts_at")) : null,
      expires_at: formData.get("expires_at") ? String(formData.get("expires_at")) : null,
      is_active: formData.get("is_active") === "true",
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .insert(stripUndefined(payload))
      .select("id")
      .single();

    if (error) {
      logger.error("Failed to create coupon", { error: error.message });
      return { error: "Errore nella creazione del coupon" };
    }

    await logAuditEvent(admin.id, "create", "coupon", data.id, undefined, payload as Record<string, unknown>);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    logger.error("createCoupon error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

export async function updateCoupon(
  id: string,
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    if (!code) return { error: "Il codice è obbligatorio" };

    const discountType = String(formData.get("discount_type") ?? "percentage");
    const discountValue = Number(formData.get("discount_value") ?? 0);

    if (discountType === "percentage" && discountValue > 100) {
      return { error: "La percentuale non può superare 100" };
    }

    const payload = {
      code,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount: formData.get("min_order_amount") ? Number(formData.get("min_order_amount")) : undefined,
      max_uses: formData.get("max_uses") ? Number(formData.get("max_uses")) : null,
      starts_at: formData.get("starts_at") ? String(formData.get("starts_at")) : null,
      expires_at: formData.get("expires_at") ? String(formData.get("expires_at")) : null,
      is_active: formData.get("is_active") === "true",
    };

    const supabase = await createClient();
    const { error } = await supabase.from("coupons").update(stripUndefined(payload)).eq("id", id);

    if (error) {
      logger.error("Failed to update coupon", { error: error.message });
      return { error: "Errore nell'aggiornamento del coupon" };
    }

    await logAuditEvent(admin.id, "update", "coupon", id, undefined, payload as Record<string, unknown>);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    logger.error("updateCoupon error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

export async function deleteCoupon(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      logger.error("Failed to delete coupon", { error: error.message });
      return { error: "Errore nell'eliminazione del coupon" };
    }

    await logAuditEvent(admin.id, "delete", "coupon", id);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    logger.error("deleteCoupon error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
