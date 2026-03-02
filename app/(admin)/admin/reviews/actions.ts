"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";

export async function approveReview(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      logger.error("Failed to approve review", { error: error.message });
      return { error: "Errore nell'approvazione della recensione" };
    }

    await logAuditEvent(admin.id, "approve", "review", id);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (err) {
    logger.error("approveReview error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

export async function rejectReview(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Failed to reject review", { error: error.message });
      return { error: "Errore nel rifiuto della recensione" };
    }

    await logAuditEvent(admin.id, "reject", "review", id);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (err) {
    logger.error("rejectReview error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
