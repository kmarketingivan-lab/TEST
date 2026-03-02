"use client";

import { useState, useCallback } from "react";
import type { ProductVariant } from "@/types/database";
import { VariantSelector } from "@/components/storefront/variant-selector";
import { QuantitySelector } from "@/components/storefront/quantity-selector";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatPrice } from "@/components/storefront/product-card";

interface ProductDetailClientProps {
  productId: string;
  basePrice: number;
  stockQuantity: number;
  variants: ProductVariant[];
}

function ProductDetailClient({ productId, basePrice, stockQuantity, variants }: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const totalPrice = basePrice + (selectedVariant?.price_adjustment ?? 0);
  const effectiveStock = selectedVariant ? selectedVariant.stock_quantity : stockQuantity;
  const isOutOfStock = effectiveStock <= 0;

  const handleVariantSelect = useCallback((variantId: string | null) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Variant selector */}
      {variants.length > 0 && (
        <>
          <VariantSelector
            variants={variants}
            selectedId={selectedVariantId}
            onSelect={handleVariantSelect}
          />
          {selectedVariant && selectedVariant.price_adjustment !== 0 && (
            <p className="text-sm text-gray-600">
              Prezzo con variante: <span className="font-semibold text-red-700">{formatPrice(totalPrice)}</span>
            </p>
          )}
        </>
      )}

      {/* Quantity selector */}
      {!isOutOfStock && (
        <div>
          <label className="text-sm font-medium text-gray-700">Quantità</label>
          <div className="mt-1">
            <QuantitySelector
              max={effectiveStock}
              value={quantity}
              onChange={setQuantity}
            />
          </div>
        </div>
      )}

      {/* Add to cart */}
      <AddToCartButton
        productId={productId}
        variantId={selectedVariantId}
        quantity={quantity}
        disabled={isOutOfStock}
      />
    </div>
  );
}

export { ProductDetailClient };
