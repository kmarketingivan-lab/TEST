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
  requiresAgeVerification?: boolean;
}

function ProductDetailClient({ productId, basePrice, stockQuantity, variants, requiresAgeVerification = false }: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);

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
      {/* Age verification modal for pyrotechnics */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Verifica età</h3>
            <p className="mb-4 text-sm text-gray-700">
              Questo articolo è classificato come materiale pirotecnico.{" "}
              <strong>La vendita è riservata ai maggiori di 18 anni.</strong>
            </p>
            <p className="mb-5 text-sm font-semibold text-gray-900">
              Confermo di avere almeno 18 anni e di essere legalmente autorizzato all&apos;acquisto di articoli pirotecnici.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setAgeConfirmed(true); setShowAgeModal(false); }}
                className="flex-1 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                Confermo — ho 18+ anni
              </button>
              <button
                onClick={() => setShowAgeModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
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
      {requiresAgeVerification && !ageConfirmed ? (
        <button
          type="button"
          onClick={() => setShowAgeModal(true)}
          className="w-full rounded-lg bg-yellow-600 px-6 py-3 text-sm font-semibold text-white hover:bg-yellow-700"
        >
          Verifica età per aggiungere al carrello
        </button>
      ) : (
        <AddToCartButton
          productId={productId}
          variantId={selectedVariantId}
          quantity={quantity}
          disabled={isOutOfStock}
        />
      )}
    </div>
  );
}

export { ProductDetailClient };
