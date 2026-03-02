import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { CalendarCheck } from "lucide-react";
import { Badge, getStatusVariant } from "@/components/ui/badge";
import { BookingActions } from "./booking-actions";
import type { Booking, BookingService } from "@/types/database";

type BookingWithService = Booking & {
  booking_services: Pick<BookingService, "name"> | null;
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const perPage = 10;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createClient();

  const { data, count } = await supabase
    .from("bookings")
    .select("*, booking_services(name)", { count: "exact" })
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false })
    .range(from, to);

  const bookings = (data ?? []) as unknown as BookingWithService[];
  const totalPages = Math.ceil((count ?? 0) / perPage);

  if (bookings.length === 0 && page === 1) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prenotazioni</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16">
          <CalendarCheck className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-600">Nessuna prenotazione</p>
          <Link
            href="/bookings"
            className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Prenota ora
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Prenotazioni</h1>
      <p className="mt-1 text-sm text-gray-600">
        {count ?? 0} prenotazion{(count ?? 0) === 1 ? "e" : "i"}
      </p>

      <div className="mt-6 space-y-3">
        {bookings.map((booking) => {
          const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
          const isFuture = bookingDateTime > now;
          const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
          const canCancel =
            isFuture &&
            (booking.status === "pending" || booking.status === "confirmed") &&
            hoursUntil >= 24;
          const tooLateToCancel =
            isFuture &&
            (booking.status === "pending" || booking.status === "confirmed") &&
            hoursUntil < 24;

          return (
            <div
              key={booking.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/account/bookings/${booking.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-red-700"
                  >
                    {booking.booking_services?.name ?? "Servizio"}
                  </Link>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(booking.booking_date).toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  — {booking.start_time} - {booking.end_time}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/account/bookings/${booking.id}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Dettagli
                </Link>
                {canCancel && (
                  <BookingActions bookingId={booking.id} />
                )}
                {tooLateToCancel && (
                  <span
                    className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400"
                    title="La cancellazione è possibile solo con almeno 24 ore di anticipo"
                  >
                    Cancella
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/account/bookings?page=${page - 1}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Precedente
            </Link>
          )}
          <span className="text-sm text-gray-600">
            Pagina {page} di {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/account/bookings?page=${page + 1}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Successiva
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
