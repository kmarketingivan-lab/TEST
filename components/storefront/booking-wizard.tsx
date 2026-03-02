"use client";

import { useState } from "react";
import { BookingCalendar } from "./booking-calendar";
import { BookingForm } from "./booking-form";

interface ServiceOption {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  priceFormatted: string;
}

interface BookingWizardProps {
  services: ServiceOption[];
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return hours === 1 ? "1 ora" : `${hours} ore`;
  return `${hours} or${hours === 1 ? "a" : "e"} ${remaining} min`;
}

const serviceIcons: Record<string, string> = {
  consulenza: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  riparazione: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  default: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

function getServiceIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(serviceIcons)) {
    if (key !== "default" && lower.includes(key)) return icon;
  }
  return serviceIcons["default"]!;
}

function BookingWizard({ services }: BookingWizardProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start_time: string; end_time: string } | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  if (bookingConfirmed) {
    return null; // The BookingForm component handles the success state
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${selectedServiceId ? "bg-green-500 text-white" : "bg-red-700 text-white"}`}>1</span>
        <span className={selectedServiceId ? "text-green-600 font-medium" : "text-red-700 font-medium"}>Servizio</span>
        <span className="mx-1 text-gray-300">&rarr;</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${selectedSlot?.start_time ? "bg-green-500 text-white" : selectedServiceId ? "bg-red-700 text-white" : "bg-gray-200 text-gray-500"}`}>2</span>
        <span className={selectedSlot?.start_time ? "text-green-600 font-medium" : selectedServiceId ? "text-red-700 font-medium" : "text-gray-400"}>Data e ora</span>
        <span className="mx-1 text-gray-300">&rarr;</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${selectedSlot?.start_time ? "bg-red-700 text-white" : "bg-gray-200 text-gray-500"}`}>3</span>
        <span className={selectedSlot?.start_time ? "text-red-700 font-medium" : "text-gray-400"}>Conferma</span>
      </div>

      {/* Step 1: Select service */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900">1. Scegli un servizio</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                setSelectedServiceId(service.id);
                setSelectedDate(null);
                setSelectedSlot(null);
              }}
              className={`rounded-lg border p-4 text-left transition-all ${
                selectedServiceId === service.id
                  ? "border-red-700 bg-red-50 ring-2 ring-red-700"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${selectedServiceId === service.id ? "bg-red-700 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getServiceIcon(service.name)} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="font-semibold text-gray-900">{service.priceFormatted}</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(service.duration_minutes)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: Select date and time */}
      {selectedServiceId && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Scegli data e orario</h2>
          <div className="mt-4">
            <BookingCalendar
              serviceId={selectedServiceId}
              onSelectSlot={(date, slot) => {
                setSelectedDate(date);
                setSelectedSlot(slot);
              }}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
            />
          </div>
        </section>
      )}

      {/* Step 3: Fill booking form with full summary */}
      {selectedServiceId && selectedDate && selectedSlot?.start_time && selectedService && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. Completa la prenotazione</h2>

          {/* Step 4-like summary */}
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Riepilogo</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Servizio</dt>
                <dd className="font-medium text-gray-900">{selectedService.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Prezzo</dt>
                <dd className="font-medium text-gray-900">{selectedService.priceFormatted}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Durata</dt>
                <dd className="font-medium text-gray-900">{formatDuration(selectedService.duration_minutes)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Data</dt>
                <dd className="font-medium text-gray-900">{selectedDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Orario</dt>
                <dd className="font-medium text-gray-900">{selectedSlot.start_time} - {selectedSlot.end_time}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-4">
            <BookingForm
              serviceId={selectedServiceId}
              serviceName={selectedService.name}
              bookingDate={selectedDate}
              startTime={selectedSlot.start_time}
              endTime={selectedSlot.end_time}
              onSuccess={() => setBookingConfirmed(true)}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export { BookingWizard };
