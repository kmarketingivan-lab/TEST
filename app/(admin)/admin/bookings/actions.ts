"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import {
  bookingSchema,
  bookingServiceSchema,
  bookingAvailabilitySchema,
} from "@/lib/validators/bookings";
import { logAuditEvent } from "@/lib/utils/audit";
import { logger } from "@/lib/utils/logger";
import { stripUndefined } from "@/lib/utils/supabase-helpers";

// ============================================
// Booking status management
// ============================================

/**
 * Confirm a booking.
 * @param id - Booking ID
 * @returns Success or error result
 */
export async function confirmBooking(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  return updateBookingStatus(id, "confirmed");
}

/**
 * Cancel a booking.
 * @param id - Booking ID
 * @returns Success or error result
 */
export async function cancelBooking(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  return updateBookingStatus(id, "cancelled");
}

/**
 * Complete a booking.
 * @param id - Booking ID
 * @returns Success or error result
 */
export async function completeBooking(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  return updateBookingStatus(id, "completed");
}

/**
 * Mark a booking as no-show.
 * @param id - Booking ID
 * @returns Success or error result
 */
export async function markNoShow(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  return updateBookingStatus(id, "no_show");
}

async function updateBookingStatus(
  id: string,
  newStatus: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { data: booking } = await supabase
      .from("bookings")
      .select("status")
      .eq("id", id)
      .single();

    if (!booking) return { error: "Prenotazione non trovata" };

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) return { error: "Errore nell'aggiornamento dello stato" };

    await logAuditEvent(admin.id, "update_status", "booking", id, { status: booking.status }, { status: newStatus });
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err) {
    logger.error("updateBookingStatus error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

// ============================================
// Availability management
// ============================================

/**
 * Update availability settings.
 * @param data - Availability data
 * @returns Success or error result
 */
export async function updateAvailability(
  data: {
    id?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();

    const parsed = bookingAvailabilitySchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const supabase = await createClient();

    if (data.id) {
      const { error } = await supabase
        .from("booking_availability")
        .update(parsed.data)
        .eq("id", data.id);

      if (error) return { error: "Errore nell'aggiornamento" };
      await logAuditEvent(admin.id, "update", "booking_availability", data.id);
    } else {
      const { error } = await supabase
        .from("booking_availability")
        .insert(parsed.data);

      if (error) return { error: "Errore nella creazione" };
      await logAuditEvent(admin.id, "create", "booking_availability", "new");
    }

    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err) {
    logger.error("updateAvailability error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

// ============================================
// Service management
// ============================================

/**
 * Create a booking service.
 * @param formData - Service form data
 * @returns Success or error result
 */
export async function createService(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();

    const raw = {
      name: formData.get("name"),
      description: formData.get("description") || null,
      duration_minutes: Number(formData.get("duration_minutes")),
      price: Number(formData.get("price")),
      is_active: formData.get("is_active") !== "false",
      sort_order: Number(formData.get("sort_order") ?? 0),
    };

    const parsed = bookingServiceSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("booking_services")
      .insert(stripUndefined(parsed.data))
      .select("id")
      .single();

    if (error) return { error: "Errore nella creazione del servizio" };

    await logAuditEvent(admin.id, "create", "booking_service", data.id);
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err) {
    logger.error("createService error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Update a booking service.
 * @param id - Service ID
 * @param formData - Updated service form data
 * @returns Success or error result
 */
export async function updateService(
  id: string,
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();

    const raw = {
      name: formData.get("name"),
      description: formData.get("description") || null,
      duration_minutes: Number(formData.get("duration_minutes")),
      price: Number(formData.get("price")),
      is_active: formData.get("is_active") !== "false",
      sort_order: Number(formData.get("sort_order") ?? 0),
    };

    const parsed = bookingServiceSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("booking_services")
      .update(stripUndefined(parsed.data))
      .eq("id", id);

    if (error) return { error: "Errore nell'aggiornamento del servizio" };

    await logAuditEvent(admin.id, "update", "booking_service", id);
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err) {
    logger.error("updateService error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

/**
 * Delete a booking service.
 * @param id - Service ID
 * @returns Success or error result
 */
export async function deleteService(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("booking_services")
      .delete()
      .eq("id", id);

    if (error) return { error: "Errore nell'eliminazione del servizio" };

    await logAuditEvent(admin.id, "delete", "booking_service", id);
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err) {
    logger.error("deleteService error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}

// ============================================
// Public booking action
// ============================================

/**
 * Create a new booking (public action).
 * NOTE: Race condition possible — see KNOWN_ISSUES.md
 * @param formData - Booking form data
 * @returns Success or error result
 */
export async function createBooking(
  formData: FormData
): Promise<{ success: boolean } | { error: string }> {
  try {
    const raw = {
      service_id: formData.get("service_id"),
      customer_name: formData.get("customer_name"),
      customer_email: formData.get("customer_email"),
      customer_phone: formData.get("customer_phone") || null,
      booking_date: formData.get("booking_date"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      notes: formData.get("notes") || null,
    };

    const parsed = bookingSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
    }

    const supabase = await createClient();

    // Verify slot is still available (race condition possible)
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_date", parsed.data.booking_date)
      .neq("status", "cancelled")
      .lt("start_time", parsed.data.end_time)
      .gt("end_time", parsed.data.start_time);

    if (conflicts && conflicts.length > 0) {
      return { error: "Lo slot selezionato non è più disponibile" };
    }

    const { error } = await supabase
      .from("bookings")
      .insert(stripUndefined(parsed.data));

    if (error) {
      if (error.code === "23505") {
        return { error: "Questo slot è già stato prenotato" };
      }
      logger.error("Failed to create booking", { error: error.message });
      return { error: "Errore nella creazione della prenotazione" };
    }

    return { success: true };
  } catch (err) {
    logger.error("createBooking error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore interno del server" };
  }
}
