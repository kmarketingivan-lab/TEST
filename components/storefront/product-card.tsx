"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product, ProductImage } from "@/types/database";
import { StockBadge } from "@/components/storefront/stock-badge";
import { QuickViewModal } from "@/components/storefront/quick-view-modal";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ProductCardProps {
  product: Product & { product_images?: ProductImage[] | undefined; brand_name?: string | undefined };
}

/** Formats a number as EUR currency string. */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function ProductCard({ product }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const hasDiscount =
    product.compare_at_price !== null && product.compare_at_price > product.price;

  const images = product.product_images ?? [];
  const primaryImage =
    images.find((img) => img.is_primary) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0];

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md">
        <Link href={`/products/${product.slug}`} className="block">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.is_featured && (
              <span className="absolute left-2 top-2 z-10 rounded bg-yellow-600 px-2 py-0.5 text-xs font-semibold text-white">
                In evidenza
              </span>
            )}
            {hasDiscount && (
              <span className="absolute right-2 top-2 z-10 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                Offerta
              </span>
            )}
            {product.brand_name && (
              <span className="absolute left-2 bottom-2 z-10 rounded bg-gray-800 px-2 py-0.5 text-xs font-medium text-white">
                {product.brand_name}
              </span>
            )}
            {primaryImage ? (
              <OptimizedImage
                src={primaryImage.url}
                alt={primaryImage.alt_text ?? product.name}
                fill
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-red-600 line-clamp-2">
              {product.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-red-700">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && product.compare_at_price !== null && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
            <div className="mt-2">
              <StockBadge
                stockQuantity={product.stock_quantity}
                lowStockThreshold={product.low_stock_threshold ?? undefined}
              />
            </div>
          </div>
        </Link>

        {/* Quick view button (visible on hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuickViewOpen(true);
          }}
          className="absolute bottom-[calc(50%+1rem)] left-1/2 z-20 -translate-x-1/2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
        >
          Anteprima
        </button>
      </div>

      {/* Quick view modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}

export { ProductCard, formatPrice };
