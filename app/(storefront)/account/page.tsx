import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import type { Order, Booking, Profile } from "@/types/database";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Fetch profile, orders, bookings in parallel
  const [profileResult, ordersResult, bookingsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("bookings")
      .select("*")
      .eq("customer_email", user.email)
      .order("booking_date", { ascending: false })
      .limit(10),
  ]);

  const profile = profileResult.data as Profile | null;
  const orders = (ordersResult.data ?? []) as Order[];
  const bookings = (bookingsResult.data ?? []) as Booking[];

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Il mio account</h1>

      {/* Profile section */}
      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Profilo</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Nome</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {profile?.full_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Telefono</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {profile?.phone ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Orders history */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Ordini recenti</h2>
        {orders.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Ordine</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Data</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Totale</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Nessun ordine effettuato</p>
        )}
      </section>

      {/* Bookings history */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Prenotazioni recenti</h2>
        {bookings.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Data</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Orario</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {booking.start_time} — {booking.end_time}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Nessuna prenotazione</p>
        )}
      </section>

      {/* Logout */}
      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Torna alla home
        </Link>
      </div>
    </div>
  );
}
