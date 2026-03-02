"use server";

import { logger } from "@/lib/utils/logger";

export async function submitContactForm(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const message = formData.get("message") as string | null;

    if (!name || !email || !message) {
      return { error: "Tutti i campi sono obbligatori" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Email non valida" };
    }

    // Log contact form submission
    logger.info("Contact form submission", { name, email, messageLength: message.length });

    // Try sending via email module if available
    try {
      const emailModule = await import("@/lib/email/send").catch(() => null) as { sendContactEmail?: (data: { name: string; email: string; message: string }) => Promise<void> } | null;
      if (emailModule?.sendContactEmail) {
        await emailModule.sendContactEmail({ name, email, message });
      }
    } catch {
      // Email not configured — form submission still succeeds
    }

    return { success: true };
  } catch (err) {
    logger.error("submitContactForm error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
