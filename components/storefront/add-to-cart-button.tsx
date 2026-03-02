"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { addToCartAction } from "@/lib/cart/actions";

interface AddToCartButtonProps {
  productId: string;
  variantId: string | null;
  quantity: number;
  disabled?: boolean | undefined;
}

function AddToCartButton({ productId, variantId, quantity, disabled }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const isDisabled = disabled ?? false;

  const handleClick = useCallback(async () => {
    setLoading(true);
    const result = await addToCartAction(productId, variantId, quantity);
    setLoading(false);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Prodotto aggiunto al carrello");
      router.refresh();
    }
  }, [productId, variantId, quantity, addToast, router]);

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading || isDisabled}
      className="inline-flex items-center justify-center rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Aggiunta...
        </>
      ) : isDisabled ? (
        "Esaurito"
      ) : (
        "Aggiungi al carrello"
      )}
    </button>
  );
}

export { AddToCartButton };
