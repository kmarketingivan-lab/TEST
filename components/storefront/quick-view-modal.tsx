"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Product, ProductImage } from "@/types/database";
import { StockBadge } from "@/components/storefront/stock-badge";
import { QuantitySelector } from "@/components/storefront/quantity-selector";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatPrice } from "@/components/storefront/product-card";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface QuickViewModalProps {
  product: Product & { product_images?: ProductImage[] | undefined };
  onClose: () => void;
}

function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);

  const images = product.product_images ?? [];
  const primaryImage =
    images.find((img) => img.is_primary) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0];

  const hasDiscount =
    product.compare_at_price !== null && product.compare_at_price > product.price;

  // ESC key closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Chiudi"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {primaryImage ? (
              <OptimizedImage
                src={primaryImage.url}
                alt={primaryImage.alt_text ?? product.name}
                fill
                className="h-full w-full object-cover"
                sizes="(max-width: 640px) 100vw, 300px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-red-700">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && product.compare_at_price !== null && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            <StockBadge
              stockQuantity={product.stock_quantity}
              lowStockThreshold={product.low_stock_threshold ?? undefined}
            />

            {product.stock_quantity > 0 && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Quantità</label>
                  <div className="mt-1">
                    <QuantitySelector
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={setQuantity}
                    />
                  </div>
                </div>

                <AddToCartButton
                  productId={product.id}
                  variantId={null}
                  quantity={quantity}
                />
              </>
            )}

            <Link
              href={`/products/${product.slug}`}
              className="inline-block text-sm text-red-600 hover:underline"
            >
              Vedi dettagli completi &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { QuickViewModal };
