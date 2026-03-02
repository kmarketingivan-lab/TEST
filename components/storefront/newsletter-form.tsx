"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { subscribeAction } from "@/components/storefront/newsletter-action";

interface NewsletterFormProps {
  compact?: boolean;
}

export function NewsletterForm({ compact = false }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await subscribeAction(email.trim());
      addToast("success", "Iscrizione avvenuta con successo!");
      setEmail("");
    } catch {
      addToast("error", "Errore durante l'iscrizione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="La tua email"
          required
          className="w-full min-w-0 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-red-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    );
  }

  return (
    <section className="bg-red-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            Iscriviti alla newsletter
          </h2>
          <p className="mt-2 text-sm text-red-200">
            Ricevi offerte esclusive e novità direttamente nella tua casella
            email.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci la tua email"
              required
              className="flex-1 rounded-full border-0 bg-white/10 px-4 py-3 text-sm text-white placeholder-red-300 outline-none ring-1 ring-white/20 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-red-900 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {loading ? "..." : "Iscriviti"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
