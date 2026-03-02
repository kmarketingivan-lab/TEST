"use server";

import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logger } from "@/lib/utils/logger";
import { rateLimitByIp } from "@/lib/utils/rate-limit";
import { sendWelcomeEmail } from "@/lib/email/send";

// ============================================
// Validation schemas
// ============================================

const signInSchema = z.object({
  email: z.email("Email non valida"),
  password: z.string().min(6, "Password minimo 6 caratteri"),
});

const signUpSchema = z.object({
  email: z.email("Email non valida"),
  password: z.string().min(8, "Password minimo 8 caratteri"),
  full_name: z.string().min(2, "Nome minimo 2 caratteri").max(100),
});

const resetPasswordSchema = z.object({
  email: z.email("Email non valida"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password minimo 8 caratteri"),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Inserisci la password attuale"),
  new_password: z.string().min(8, "La nuova password deve avere almeno 8 caratteri"),
});

// ============================================
// Auth actions
// ============================================

/**
 * Sign in with email and password.
 * Rate limited: max 5 attempts per 15 minutes per email.
 * @param formData - FormData with email and password
 * @returns Error result or redirects on success
 */
export async function signIn(
  formData: FormData
): Promise<{ error: string } | void> {
  try {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const { success: allowed } = await rateLimitByIp("auth", "auth");
    if (!allowed) {
      logger.warn("Rate limit exceeded for login", { email: parsed.data.email });
      return { error: "Troppe richieste. Riprova tra poco." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      logger.warn("Sign in failed", { email: parsed.data.email, error: error.message });
      return { error: "Email o password non corretti" };
    }
  } catch (err) {
    logger.error("signIn error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }

  redirect("/");
}

/**
 * Sign up with email, password, and full name.
 * @param formData - FormData with email, password, and full_name
 * @returns Error result or redirects on success
 */
export async function signUp(
  formData: FormData
): Promise<{ error: string } | void> {
  try {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
      full_name: formData.get("full_name"),
    };

    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const { success: allowed } = await rateLimitByIp("auth", "auth");
    if (!allowed) {
      logger.warn("Rate limit exceeded for register", { email: parsed.data.email });
      return { error: "Troppe richieste. Riprova tra poco." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.full_name,
        },
      },
    });

    if (error) {
      logger.warn("Sign up failed", { email: parsed.data.email, error: error.message });
      return { error: "Errore nella registrazione. L'email potrebbe essere già in uso." };
    }

    // Send welcome email (non-blocking, skip if not configured)
    void sendWelcomeEmail(parsed.data.email, parsed.data.full_name);
  } catch (err) {
    logger.error("signUp error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }

  redirect("/");
}

/**
 * Sign out the current user.
 * @returns Error result or redirects on success
 */
export async function signOut(): Promise<{ error: string } | void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Sign out failed", { error: error.message });
      return { error: "Errore nel logout" };
    }
  } catch (err) {
    logger.error("signOut error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }

  redirect("/admin/login");
}

/**
 * Request a password reset email.
 * @param formData - FormData with email
 * @returns Success or error result
 */
export async function resetPassword(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const raw = { email: formData.get("email") };

    const parsed = resetPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const { success: allowed } = await rateLimitByIp("auth", "auth");
    if (!allowed) {
      logger.warn("Rate limit exceeded for reset password");
      return { error: "Troppe richieste. Riprova tra poco." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email
    );

    if (error) {
      logger.error("Reset password failed", { error: error.message });
      // Don't reveal if email exists
    }

    // Always return success to prevent email enumeration
    return { success: true };
  } catch (err) {
    logger.error("resetPassword error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Update the current user's password.
 * @param formData - FormData with new password
 * @returns Success or error result
 */
export async function updatePassword(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const raw = { password: formData.get("password") };

    const parsed = updatePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      logger.error("Update password failed", { error: error.message });
      return { error: "Errore nell'aggiornamento della password" };
    }

    return { success: true };
  } catch (err) {
    logger.error("updatePassword error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Change password for authenticated user (requires current password verification).
 * @param formData - FormData with current_password and new_password
 * @returns Success or error result
 */
export async function changePassword(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const raw = {
      current_password: formData.get("current_password"),
      new_password: formData.get("new_password"),
    };

    const parsed = changePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const supabase = await createClient();

    // Verify current password by attempting sign-in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return { error: "Utente non autenticato" };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.current_password,
    });

    if (signInError) {
      return { error: "La password attuale non è corretta" };
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.new_password,
    });

    if (error) {
      logger.error("Change password failed", { error: error.message });
      return { error: "Errore nel cambio password" };
    }

    return { success: true };
  } catch (err) {
    logger.error("changePassword error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
