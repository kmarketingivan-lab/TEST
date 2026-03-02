"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error);
    }).catch(() => {
      console.error("[GlobalError]", error.message, error.digest);
    });
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-3xl font-bold text-neutral-900">Si è verificato un errore</h2>
      <p className="mt-3 text-neutral-600">Qualcosa è andato storto. Riprova.</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-full bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
      >
        Riprova
      </button>
    </div>
  );
}
