import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Fetch booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, booking_date, start_time, status, user_id")
      .eq("id", id)
      .single();

    if (!booking || booking.user_id !== user.id) {
      return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });
    }

    if (booking.status !== "pending" && booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Solo prenotazioni in attesa o confermate possono essere cancellate" },
        { status: 400 }
      );
    }

    // Check >= 24h
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const hoursUntil = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntil < 24) {
      return NextResponse.json(
        { error: "La cancellazione è possibile solo con almeno 24 ore di anticipo" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      logger.error("Booking cancel failed", { error: error.message });
      return NextResponse.json({ error: "Errore nella cancellazione" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("PUT /api/account/bookings/cancel error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
