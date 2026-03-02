import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Booking, BookingService } from "@/types/database";

/**
 * Cron job endpoint: sends booking reminder emails for tomorrow's bookings.
 *
 * Setup:
 * - Configure a cron job to call POST /api/cron/booking-reminders daily (e.g., 8:00 AM).
 * - Set the CRON_API_KEY environment variable and pass it in the Authorization header.
 * - Example (Vercel Cron): add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/booking-reminders", "schedule": "0 8 * * *" }] }
 * - Requires lib/email/send.ts with sendBookingReminder function (G stream).
 */
export async function POST(request: Request) {
  // Verify API key
  const authHeader = request.headers.get("authorization");
  const cronKey = process.env.CRON_API_KEY ?? process.env.CRON_SECRET;

  if (!cronKey || authHeader !== `Bearer ${cronKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Find bookings for tomorrow that are confirmed
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*, booking_services(*)")
      .eq("booking_date", tomorrowStr!)
      .in("status", ["confirmed", "pending"]);

    if (error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: "No bookings for tomorrow", sent: 0 });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const booking of bookings as (Booking & { booking_services: BookingService })[]) {
      try {
        // Try importing sendBookingReminder from G stream
        const emailModule = await import("@/lib/email/send").catch(() => null) as { sendBookingReminder?: (booking: Booking, service: BookingService) => Promise<void> } | null;
        if (emailModule?.sendBookingReminder) {
          await emailModule.sendBookingReminder(booking, booking.booking_services);
          sent++;
        } else {
          // Email module not available yet — log and skip
          errors.push(`Email module not configured — skipped ${booking.customer_email}`);
          break;
        }
      } catch (err) {
        errors.push(`Failed to send to ${booking.customer_email}: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }

    return NextResponse.json({
      message: `Processed ${bookings.length} bookings for ${tomorrowStr}`,
      sent,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Support GET for Vercel Cron which uses GET by default
  return POST(request);
}
