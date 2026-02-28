import { requireAdmin } from "@/lib/auth/helpers";
import { getBookings } from "@/lib/dal/bookings";
import { BookingsTable } from "./bookings-table";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = typeof params.status === "string" ? params.status : "";

  const opts: Parameters<typeof getBookings>[0] = { page, perPage: 20 };
  if (status) opts.status = status;

  const result = await getBookings(opts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prenotazioni</h1>
        <div className="flex gap-2">
          <Link href="/admin/bookings/services" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Servizi
          </Link>
          <Link href="/admin/bookings/availability" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Disponibilità
          </Link>
        </div>
      </div>
      <BookingsTable bookings={result.data} totalCount={result.count} page={page} currentStatus={status} />
    </div>
  );
}
