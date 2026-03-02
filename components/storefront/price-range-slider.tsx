"use client";

import { useState, useCallback } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
}

function PriceRangeSlider({ min, max, currentMin, currentMax, onChange }: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);

  const range = max - min || 1;
  const minPercent = ((localMin - min) / range) * 100;
  const maxPercent = ((localMax - min) / range) * 100;

  const handleMinSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), localMax - 1);
      setLocalMin(val);
      onChange(val, localMax);
    },
    [localMax, onChange]
  );

  const handleMaxSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), localMin + 1);
      setLocalMax(val);
      onChange(localMin, val);
    },
    [localMin, onChange]
  );

  const handleMinInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val) && val >= min && val < localMax) {
        setLocalMin(val);
        onChange(val, localMax);
      }
    },
    [min, localMax, onChange]
  );

  const handleMaxInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val) && val <= max && val > localMin) {
        setLocalMax(val);
        onChange(localMin, val);
      }
    },
    [max, localMin, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Dual range slider */}
      <div className="relative h-2">
        {/* Track background */}
        <div className="absolute inset-0 rounded bg-gray-200" />
        {/* Active range */}
        <div
          className="absolute h-full rounded bg-red-600"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={handleMinSlider}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-red-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={handleMaxSlider}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-red-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Numeric inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="sr-only">Prezzo minimo</label>
          <div className="flex items-center rounded border border-gray-300 px-2 py-1">
            <span className="text-xs text-gray-500">&euro;</span>
            <input
              type="number"
              value={localMin}
              onChange={handleMinInput}
              min={min}
              max={localMax - 1}
              className="ml-1 w-full text-sm focus:outline-none"
            />
          </div>
        </div>
        <span className="text-gray-400">&ndash;</span>
        <div className="flex-1">
          <label className="sr-only">Prezzo massimo</label>
          <div className="flex items-center rounded border border-gray-300 px-2 py-1">
            <span className="text-xs text-gray-500">&euro;</span>
            <input
              type="number"
              value={localMax}
              onChange={handleMaxInput}
              min={localMin + 1}
              max={max}
              className="ml-1 w-full text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { PriceRangeSlider };
export type { PriceRangeSliderProps };
