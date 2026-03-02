"use client";

import { useState, useCallback } from "react";
import { validateCouponAction } from "@/lib/cart/actions";

interface CouponFormProps {
  onApply: (code: string, label: string) => void;
  onRemove: () => void;
  appliedCode?: string | null;
  appliedLabel?: string | null;
}

/**
 * Coupon code input + apply/remove. Client component.
 */
function CouponForm({ onApply, onRemove, appliedCode, appliedLabel }: CouponFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    const result = await validateCouponAction(code.trim());
    setLoading(false);

    if (result.valid) {
      onApply(code.trim(), result.label);
      setCode("");
    } else {
      setError(result.error);
    }
  }, [code, onApply]);

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
        <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="flex-1 text-sm text-green-800">
          Sconto applicato: <strong>{appliedLabel ?? appliedCode}</strong>
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-green-700 hover:text-green-900 underline"
        >
          Rimuovi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(null); }}
          placeholder="Codice coupon"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-700"
        />
        <button
          type="button"
          onClick={() => void handleApply()}
          disabled={loading || !code.trim()}
          className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
        >
          {loading ? "..." : "Applica"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export { CouponForm };
