"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as {
        sessionId?: string;
        url?: string;
        error?: string;
      };

      if (res.status === 503) {
        addToast(
          "info",
          "I pagamenti saranno disponibili a breve. Contattaci per ordinare."
        );
        return;
      }

      if (!res.ok || !data.url) {
        addToast("error", data.error ?? "Errore durante il checkout");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      addToast("error", "Errore di rete durante il checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className="bg-red-700 hover:bg-red-800 text-white rounded-full px-8 py-3 text-lg font-bold disabled:opacity-50 transition-colors"
    >
      {loading ? "Reindirizzamento…" : "Paga con Stripe"}
    </button>
  );
}
