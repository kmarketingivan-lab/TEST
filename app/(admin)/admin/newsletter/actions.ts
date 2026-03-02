"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";

export async function toggleNewsletterSubscription(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { data: sub } = await supabase
      .from("newsletter_subscribers")
      .select("is_active")
      .eq("id", id)
      .single();

    if (!sub) return { error: "Iscritto non trovato" };

    const newActive = !(sub as { is_active: boolean }).is_active;
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: newActive })
      .eq("id", id);

    if (error) {
      logger.error("Failed to toggle newsletter sub", { error: error.message });
      return { error: "Errore nel cambio stato" };
    }

    await logAuditEvent(admin.id, "toggle_active", "newsletter_subscriber", id);
    revalidatePath("/admin/newsletter");
    return { success: true };
  } catch (err) {
    logger.error("toggleNewsletterSubscription error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
