interface StockBadgeProps {
  stockQuantity: number;
  lowStockThreshold?: number | undefined;
}

function StockBadge({ stockQuantity, lowStockThreshold }: StockBadgeProps) {
  const threshold = lowStockThreshold ?? 3;

  if (stockQuantity <= 0) {
    return (
      <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
        Esaurito
      </span>
    );
  }

  if (stockQuantity <= threshold) {
    return (
      <span className="inline-block rounded bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
        Ultimi {stockQuantity} pezzi
      </span>
    );
  }

  return null;
}

export { StockBadge };
export type { StockBadgeProps };
