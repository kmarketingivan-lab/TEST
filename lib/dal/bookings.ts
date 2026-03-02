import { createClient } from "@/lib/supabase/server";
import type { Booking, BookingService, BookingAvailability } from "@/types/database";

interface GetBookingsOptions {
  page?: number;
  perPage?: number;
  status?: string;
  date?: string;
}

interface PaginatedBookings {
  data: Booking[];
  count: number;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
}

/**
 * Get bookings with filtering and pagination.
 * @param options - Filtering options
 * @returns Paginated bookings
 */
export async function getBookings(
  options: GetBookingsOptions = {}
): Promise<PaginatedBookings> {
  const { page = 1, perPage = 20, status, date } = options;
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("bookings")
    .select("*", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (date) query = query.eq("booking_date", date);

  query = query.order("booking_date", { ascending: true }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as Booking[],
    count: count ?? 0,
  };
}

/**
 * Get a single booking by ID.
 * @param id - Booking UUID
 * @returns Booking or null
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Booking;
}

/**
 * Get available time slots for a given date and service.
 * Calculates slots based on availability, service duration, and existing bookings.
 * @param date - Date string (YYYY-MM-DD)
 * @param serviceId - Service UUID
 * @returns Array of available time slots
 */
export async function getAvailableSlots(
  date: string,
  serviceId: string
): Promise<TimeSlot[]> {
  const supabase = await createClient();

  // Get the day of week (0=Sunday, 6=Saturday)
  const dayOfWeek = new Date(date).getDay();

  // Get availability for this day
  const { data: availability } = await supabase
    .from("booking_availability")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (!availability || availability.length === 0) return [];

  // Get service duration
  const { data: service } = await supabase
    .from("booking_services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single();

  if (!service) return [];
  const durationMinutes = (service as BookingService).duration_minutes;

  // Get existing bookings for this date (non-cancelled)
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("booking_date", date)
    .neq("status", "cancelled");

  const booked = (existingBookings ?? []) as { start_time: string; end_time: string }[];

  // Generate slots
  const slots: TimeSlot[] = [];

  for (const avail of availability as BookingAvailability[]) {
    let currentMinutes = timeToMinutes(avail.start_time);
    const endMinutes = timeToMinutes(avail.end_time);

    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotStart = minutesToTime(currentMinutes);
      const slotEnd = minutesToTime(currentMinutes + durationMinutes);

      // Check if slot conflicts with existing bookings
      const hasConflict = booked.some(
        (b) => slotStart < b.end_time && slotEnd > b.start_time
      );

      if (!hasConflict) {
        slots.push({ start_time: slotStart, end_time: slotEnd });
      }

      currentMinutes += durationMinutes;
    }
  }

  return slots;
}

/**
 * Get all active booking services.
 * @returns Array of booking services
 */
export async function getBookingServices(): Promise<BookingService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booking_services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BookingService[];
}

/** Booking with joined service name. */
export type BookingWithService = Booking & {
  booking_services: { name: string } | null;
};

/**
 * Cancel a booking. Checks ownership and that booking is at least 24h away.
 */
export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  // Fetch the booking
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError) throw fetchError;

  const b = booking as Booking;

  // Check ownership
  if (b.user_id !== userId) {
    throw new Error("Non autorizzato a cancellare questa prenotazione");
  }

  // Check 24h before
  const bookingDateTime = new Date(`${b.booking_date}T${b.start_time}`);
  const now = new Date();
  const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 24) {
    throw new Error("La cancellazione è possibile solo fino a 24 ore prima");
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) throw error;
}

/**
 * Get a user's bookings with service name joined.
 */
export async function getUserBookingsWithService(
  userId: string
): Promise<BookingWithService[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, booking_services(name)")
    .eq("user_id", userId)
    .order("booking_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as BookingWithService[];
}

/** Convert HH:MM to minutes from midnight */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Convert minutes from midnight to HH:MM */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
