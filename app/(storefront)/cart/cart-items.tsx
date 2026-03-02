"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { updateCartAction, removeFromCartAction } from "@/lib/cart/actions";
import type { CartItemWithPrice } from "@/lib/cart/types";

interface CartItemsProps {
  items: CartItemWithPrice[];
}

/**
 * Client component rendering cart items with quantity selector and remove.
 */
function CartItems({ items }: CartItemsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  const handleQuantityChange = useCallback(
    async (productId: string, variantId: string | null, newQty: number) => {
      const key = `${productId}-${variantId ?? "null"}`;
      setLoading(key);
      if (newQty <= 0) {
        const result = await removeFromCartAction(productId, variantId);
        setLoading(null);
        if ("error" in result) {
          addToast("error", result.error);
        } else {
          router.refresh();
        }
      } else {
        const result = await updateCartAction(productId, variantId, newQty);
        setLoading(null);
        if ("error" in result) {
          addToast("error", result.error);
        } else {
          router.refresh();
        }
      }
    },
    [addToast, router]
  );

  const handleRemove = useCallback(
    async (productId: string, variantId: string | null) => {
      const key = `${productId}-${variantId ?? "null"}`;
      setLoading(key);
      const result = await removeFromCartAction(productId, variantId);
      setLoading(null);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        router.refresh();
      }
    },
    [addToast, router]
  );

  return (
    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
      {items.map((item) => {
        const key = `${item.productId}-${item.variantId ?? "null"}`;
        const isLoading = loading === key;
        const maxStock = item.stock ?? 999;

        return (
          <div key={key} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)} cad.</p>
              {maxStock <= 5 && maxStock > 0 && (
                <p className="mt-0.5 text-xs text-orange-600">Solo {maxStock} disponibili</p>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isLoading || item.quantity <= 1}
                onClick={() => void handleQuantityChange(item.productId, item.variantId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-l border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Diminuisci quantità"
              >
                &minus;
              </button>
              <span className="flex h-8 w-10 items-center justify-center border-y border-gray-300 bg-gray-50 text-sm font-medium">
                {item.quantity}
              </span>
              <button
                type="button"
                disabled={isLoading || item.quantity >= maxStock}
                onClick={() => void handleQuantityChange(item.productId, item.variantId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-r border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Aumenta quantità"
              >
                +
              </button>
            </div>

            {/* Subtotal */}
            <div className="w-24 text-right text-sm font-semibold text-gray-900">
              {formatPrice(item.total)}
            </div>

            {/* Remove */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleRemove(item.productId, item.variantId)}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Rimuovi
            </button>
          </div>
        );
      })}
    </div>
  );
}

export { CartItems };
