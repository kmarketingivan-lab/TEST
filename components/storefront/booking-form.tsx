"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createBooking } from "@/app/(admin)/admin/bookings/actions";

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  onSuccess?: () => void;
}

function BookingForm({ serviceId, serviceName, bookingDate, startTime, endTime, onSuccess }: BookingFormProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("service_id", serviceId);
    formData.set("booking_date", bookingDate);
    formData.set("start_time", startTime);
    formData.set("end_time", endTime);

    const email = formData.get("customer_email") as string;

    const result = await createBooking(formData);
    setLoading(false);

    if ("error" in result) {
      addToast("error", result.error);
    } else {
      setCustomerEmail(email);
      setConfirmed(true);
      addToast("success", "Prenotazione confermata!");
      // Try sending confirmation email via API (sendBookingConfirmation from G stream)
      try {
        await fetch("/api/bookings/confirm-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_email: email,
            customer_name: formData.get("customer_name") as string,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: endTime,
            service_name: serviceName,
          }),
        });
      } catch {
        // Email not configured — skip silently
      }
      onSuccess?.();
    }
  }, [serviceId, serviceName, bookingDate, startTime, endTime, addToast, onSuccess]);

  if (confirmed) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-800">Prenotazione confermata!</h3>
        <p className="mt-2 text-sm text-green-700">
          <strong>{serviceName}</strong> — {bookingDate} dalle {startTime} alle {endTime}
        </p>
        {customerEmail && (
          <p className="mt-2 text-sm text-green-600">
            Riceverai email di conferma a <strong>{customerEmail}</strong>
          </p>
        )}
        <a
          href="/bookings"
          className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Le mie prenotazioni
        </a>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome" name="customer_name" required />
        <Input label="Email" name="customer_email" type="email" required />
        <Input label="Telefono" name="customer_phone" type="tel" />
      </div>
      <Textarea label="Note (opzionale)" name="notes" placeholder="Richieste particolari..." />
      <Button type="submit" loading={loading}>
        Conferma prenotazione
      </Button>
    </form>
  );
}

export { BookingForm };
