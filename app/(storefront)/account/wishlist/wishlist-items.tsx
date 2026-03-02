"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { addToCartAction } from "@/lib/cart/actions";
import type { Product } from "@/types/database";

interface WishlistItemWithProduct {
  id: string;
  product_id: string;
  product: Pick<Product, "name" | "price" | "slug" | "stock_quantity"> & {
    product_images: { url: string; is_primary: boolean }[];
  };
}

function WishlistItems({ items }: { items: WishlistItemWithProduct[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  const handleRemove = async (wishlistId: string) => {
    setRemovingId(wishlistId);
    const res = await fetch(`/api/account/wishlist/${wishlistId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Rimosso dalla wishlist");
      router.refresh();
    } else {
      addToast("error", "Errore nella rimozione");
    }
    setRemovingId(null);
  };

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    const result = await addToCartAction(productId, null, 1);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Aggiunto al carrello");
      router.refresh();
    }
    setAddingId(null);
  };

  const getImageUrl = (item: WishlistItemWithProduct) => {
    const primary = item.product.product_images?.find((img) => img.is_primary);
    return primary?.url ?? item.product.product_images?.[0]?.url ?? null;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const imageUrl = getImageUrl(item);
        const inStock = item.product.stock_quantity > 0;

        return (
          <div
            key={item.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <Link href={`/products/${item.product.slug}`}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.product.name}
                  className="h-40 w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-md bg-gray-100 text-gray-400">
                  Nessuna immagine
                </div>
              )}
            </Link>
            <div className="mt-3">
              <Link
                href={`/products/${item.product.slug}`}
                className="text-sm font-medium text-gray-900 hover:text-red-700"
              >
                {item.product.name}
              </Link>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatPrice(item.product.price)}
              </p>
              <p className={`mt-1 text-xs ${inStock ? "text-green-600" : "text-red-600"}`}>
                {inStock ? "Disponibile" : "Esaurito"}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleRemove(item.id)}
                loading={removingId === item.id}
              >
                <Trash2 className="h-4 w-4" />
                Rimuovi
              </Button>
              {inStock && (
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(item.product_id)}
                  loading={addingId === item.product_id}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Carrello
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { WishlistItems };
