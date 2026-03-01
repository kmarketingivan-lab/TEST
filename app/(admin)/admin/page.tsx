import { requireAdmin } from "@/lib/auth/helpers";
import { getOrderStats } from "@/lib/dal/orders";
import { getProducts } from "@/lib/dal/products";
import { getOrders } from "@/lib/dal/orders";
import { getBookings } from "@/lib/dal/bookings";
import { Badge, getStatusVariant } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [orderStats, productsResult, ordersResult, bookingsResult] = await Promise.all([
    getOrderStats(),
    getProducts({ isActive: true, perPage: 1 }),
    getOrders({ perPage: 5 }),
    getBookings({ perPage: 5 }),
  ]);

  const totalOrders = Object.values(orderStats).reduce((sum, count) => sum + count, 0);
  const activeProducts = productsResult.count;
  const recentOrders = ordersResult.data;
  const recentBookings = bookingsResult.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Ordini totali"
          value={String(totalOrders)}
          icon={<ShoppingCart className="h-6 w-6 text-red-500" />}
          href="/admin/orders"
        />
        <DashboardCard
          title="Prodotti attivi"
          value={String(activeProducts)}
          icon={<Package className="h-6 w-6 text-green-500" />}
          href="/admin/products"
        />
        <DashboardCard
          title="Ordini in attesa"
          value={String(orderStats["pending"] ?? 0)}
          icon={<TrendingUp className="h-6 w-6 text-yellow-500" />}
          href="/admin/orders"
        />
        <DashboardCard
          title="Prenotazioni"
          value={String(recentBookings.length)}
          icon={<CalendarCheck className="h-6 w-6 text-purple-500" />}
          href="/admin/bookings"
        />
      </div>

      {/* Order stats by status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ordini per stato</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(orderStats).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <Badge variant={getStatusVariant(status)}>{status}</Badge>
              <span className="text-sm font-medium text-gray-700">{count}</span>
            </div>
          ))}
          {Object.keys(orderStats).length === 0 && (
            <p className="text-sm text-gray-500">Nessun ordine ancora</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Ultimi ordini</h2>
            <Link href="/admin/orders" className="text-sm text-red-700 hover:text-red-800">
              Vedi tutti
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun ordine</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    <p className="mt-1 text-xs text-gray-500">
                      {format(new Date(order.created_at), "dd MMM yyyy", { locale: it })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Ultime prenotazioni</h2>
            <Link href="/admin/bookings" className="text-sm text-red-700 hover:text-red-800">
              Vedi tutte
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-gray-500">Nessuna prenotazione</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {booking.booking_date} {booking.start_time}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
}

function DashboardCard({ title, value, icon, href }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
    </Link>
  );
}
