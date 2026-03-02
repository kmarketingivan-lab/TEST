"use client";

import { useCallback } from "react";

interface QuantitySelectorProps {
  min?: number | undefined;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

function QuantitySelector({ min = 1, max, value, onChange }: QuantitySelectorProps) {
  const decrement = useCallback(() => {
    if (value > min) onChange(value - 1);
  }, [value, min, onChange]);

  const increment = useCallback(() => {
    if (value < max) onChange(value + 1);
  }, [value, max, onChange]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        onChange(Math.max(min, Math.min(max, val)));
      }
    },
    [min, max, onChange]
  );

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Diminuisci quantità"
      >
        &minus;
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        className="w-12 border-x border-gray-300 py-2 text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Aumenta quantità"
      >
        +
      </button>
    </div>
  );
}

export { QuantitySelector };
export type { QuantitySelectorProps };
