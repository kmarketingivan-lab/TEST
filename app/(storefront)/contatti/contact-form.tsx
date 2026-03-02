"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { submitContactForm } from "./actions";

export function ContactForm() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await submitContactForm(formData);
    setLoading(false);

    if ("error" in result) {
      addToast("error", result.error);
    } else {
      setSent(true);
      addToast("success", "Messaggio inviato!");
    }
  }, [addToast]);

  if (sent) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-800">Messaggio inviato!</h3>
        <p className="mt-2 text-sm text-green-600">Ti risponderemo il prima possibile.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm text-green-700 underline hover:text-green-800"
        >
          Invia un altro messaggio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome" name="name" required />
        <Input label="Email" name="email" type="email" required />
      </div>
      <Textarea label="Messaggio" name="message" required placeholder="Come possiamo aiutarti?" />
      <Button type="submit" loading={loading}>
        Invia messaggio
      </Button>
    </form>
  );
}
