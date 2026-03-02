"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function BookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Sei sicuro di voler cancellare questa prenotazione?")) return;
    setCancelling(true);

    const res = await fetch(`/api/account/bookings/${bookingId}/cancel`, {
      method: "PUT",
    });

    if (res.ok) {
      addToast("success", "Prenotazione cancellata");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      addToast("error", (data as { error?: string }).error ?? "Errore nella cancellazione");
    }
    setCancelling(false);
  };

  return (
    <Button size="sm" variant="danger" onClick={handleCancel} loading={cancelling}>
      Cancella
    </Button>
  );
}

export { BookingActions };
