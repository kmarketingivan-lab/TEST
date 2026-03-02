import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { Badge, getStatusVariant } from "@/components/ui/badge";
import { BookingActions } from "../booking-actions";
import { ArrowLeft, Clock, Calendar, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Booking, BookingService } from "@/types/database";

type BookingWithService = Booking & {
  booking_services: Pick<BookingService, "name" | "description" | "duration_minutes" | "price"> | null;
};

const timelineSteps = [
  { key: "pending", label: "In attesa", icon: AlertCircle },
  { key: "confirmed", label: "Confermata", icon: CheckCircle },
  { key: "completed", label: "Completata", icon: CheckCircle },
] as const;

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*, booking_services(name, description, duration_minutes, price)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();

  const booking = data as unknown as BookingWithService;
  const service = booking.booking_services;

  const now = new Date();
  const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
  const isFuture = bookingDateTime > now;
  const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel =
    isFuture &&
    (booking.status === "pending" || booking.status === "confirmed") &&
    hoursUntil >= 24;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  const isCancelled = booking.status === "cancelled";

  const getStepStatus = (stepKey: string) => {
    if (isCancelled) return "cancelled";
    const statusOrder = ["pending", "confirmed", "completed"];
    const currentIdx = statusOrder.indexOf(booking.status);
    const stepIdx = statusOrder.indexOf(stepKey);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "current";
    return "upcoming";
  };

  return (
    <div>
      <Link
        href="/account/bookings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alle prenotazioni
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {service?.name ?? "Prenotazione"}
        </h1>
        <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
      </div>

      {/* Service details */}
      {service && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Servizio</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Nome</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{service.name}</dd>
            </div>
            {service.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-500">Descrizione</dt>
                <dd className="mt-1 text-sm text-gray-700">{service.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500">Durata</dt>
              <dd className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-900">
                <Clock className="h-4 w-4 text-gray-400" />
                {service.duration_minutes} minuti
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Prezzo</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {formatPrice(service.price)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Booking info */}
      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Dettagli prenotazione</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Data</dt>
            <dd className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-900">
              <Calendar className="h-4 w-4 text-gray-400" />
              {new Date(booking.booking_date).toLocaleDateString("it-IT", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Orario</dt>
            <dd className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-900">
              <Clock className="h-4 w-4 text-gray-400" />
              {booking.start_time} - {booking.end_time}
            </dd>
          </div>
          {booking.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">Note</dt>
              <dd className="mt-1 flex items-start gap-1 text-sm text-gray-700">
                <FileText className="mt-0.5 h-4 w-4 text-gray-400" />
                {booking.notes}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Timeline */}
      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Stato</h2>
        <div className="mt-4 flex items-center gap-2">
          {timelineSteps.map((step, idx) => {
            const status = getStepStatus(step.key);
            const Icon = isCancelled && idx > 0 ? XCircle : step.icon;
            return (
              <div key={step.key} className="flex items-center gap-2">
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-8 ${
                      status === "done" ? "bg-green-500" : isCancelled ? "bg-red-300" : "bg-gray-200"
                    }`}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <Icon
                    className={`h-6 w-6 ${
                      status === "done"
                        ? "text-green-500"
                        : status === "current"
                          ? "text-red-700"
                          : isCancelled
                            ? "text-red-300"
                            : "text-gray-300"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      status === "current" ? "font-semibold text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
          {isCancelled && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-red-300" />
              <div className="flex flex-col items-center gap-1">
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="text-xs font-semibold text-red-700">Cancellata</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {canCancel && <BookingActions bookingId={booking.id} />}
        <Link
          href="/bookings"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Prenota nuovo
        </Link>
      </div>
    </div>
  );
}
