"use client";

import { useCallback } from "react";
import type { ProductVariant } from "@/types/database";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variantId: string | null) => void;
}

function formatAdjustment(amount: number): string {
  const formatted = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Math.abs(amount));
  return amount > 0 ? `+${formatted}` : `-${formatted}`;
}

function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  const handleSelect = useCallback(
    (variantId: string) => {
      onSelect(selectedId === variantId ? null : variantId);
    },
    [selectedId, onSelect]
  );

  if (variants.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900">Varianti</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedId === v.id;
          const outOfStock = v.stock_quantity <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={outOfStock}
              onClick={() => handleSelect(v.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "border-red-600 bg-red-50 text-red-700 font-semibold"
                  : outOfStock
                    ? "border-gray-200 bg-gray-50 text-gray-400 line-through cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:border-red-400"
              }`}
            >
              {v.name}
              {v.price_adjustment !== 0 && (
                <span className="ml-1 text-xs">
                  ({formatAdjustment(v.price_adjustment)})
                </span>
              )}
              {outOfStock && (
                <span className="ml-1 text-xs text-red-500">Esaurito</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { VariantSelector };
