import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  User,
  ShoppingCart,
  CalendarCheck,
  Heart,
  MapPin,
  ChevronRight,
} from "lucide-react";
import type { Order, Booking, Profile } from "@/types/database";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();

  const [profileResult, ordersResult, bookingsResult, wishlistResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true })
        .gte("booking_date", new Date().toISOString().split("T")[0])
        .limit(1),
      supabase
        .from("wishlists")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const profile = profileResult.data as Profile | null;
  const orders = (ordersResult.data ?? []) as Order[];
  const nextBooking = (bookingsResult.data?.[0] ?? null) as Booking | null;
  const wishlistCount = wishlistResult.count ?? 0;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(n);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">
        Benvenuto, {profile?.full_name ?? user.email}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Profilo */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <User className="h-5 w-5 text-red-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Profilo</h2>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium text-gray-900">
                {profile?.full_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user.email}</dd>
            </div>
          </dl>
          <Link
            href="/account/profile"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Modifica
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Ordini */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <ShoppingCart className="h-5 w-5 text-red-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Ordini</h2>
          </div>
          {orders.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <span className="text-gray-700">
                      {order.order_number} —{" "}
                      {new Date(order.created_at).toLocaleDateString("it-IT")}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Nessun ordine</p>
          )}
          <Link
            href="/account/orders"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Vedi tutti
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Prenotazioni */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <CalendarCheck className="h-5 w-5 text-red-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Prenotazioni
            </h2>
          </div>
          {nextBooking ? (
            <div className="mt-4 text-sm">
              <p className="text-gray-700">
                Prossima:{" "}
                <span className="font-medium text-gray-900">
                  {new Date(nextBooking.booking_date).toLocaleDateString(
                    "it-IT"
                  )}{" "}
                  — {nextBooking.start_time}
                </span>
              </p>
              <p className="mt-1 text-gray-500">
                Stato:{" "}
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {nextBooking.status}
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Nessuna prenotazione futura
            </p>
          )}
          <Link
            href="/account/bookings"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Vedi tutte
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Wishlist */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Heart className="h-5 w-5 text-red-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Wishlist</h2>
          </div>
          <p className="mt-4 text-sm text-gray-700">
            {wishlistCount > 0
              ? `${wishlistCount} prodott${wishlistCount === 1 ? "o" : "i"} salvat${wishlistCount === 1 ? "o" : "i"}`
              : "Nessun prodotto salvato"}
          </p>
          <Link
            href="/account/wishlist"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Vedi
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Indirizzi */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <MapPin className="h-5 w-5 text-red-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Indirizzi</h2>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Gestisci i tuoi indirizzi di spedizione
          </p>
          <Link
            href="/account/addresses"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Gestisci
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
