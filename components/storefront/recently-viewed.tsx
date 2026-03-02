"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface RecentlyViewedItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 8;

export function addRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items: RecentlyViewedItem[] = raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
    const filtered = items.filter((i) => i.productId !== item.productId);
    filtered.unshift(item);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered.slice(0, MAX_ITEMS))
    );
  } catch {
    // localStorage unavailable
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw) as RecentlyViewedItem[]);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-neutral-900">
          Visti di recente
        </h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <Link
              key={item.productId}
              href={`/products/${item.slug}`}
              className="flex-shrink-0 w-36 rounded-lg border border-neutral-200 bg-white p-3 hover:shadow-md transition-shadow"
            >
              <div className="relative h-24 w-full overflow-hidden rounded bg-neutral-100">
                {item.imageUrl ? (
                  <OptimizedImage
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="h-full w-full object-cover"
                    sizes="144px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-400 text-xs">
                    Foto
                  </div>
                )}
              </div>
              <p className="mt-2 truncate text-xs font-medium text-neutral-900">
                {item.name}
              </p>
              <p className="text-xs text-red-600 font-semibold">
                {formatPrice(item.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
