"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PriceRangeSlider } from "@/components/storefront/price-range-slider";
import type { Category, Brand } from "@/types/database";

interface ProductFiltersProps {
  categories: (Category & { children?: Category[] | undefined })[];
  brands: Brand[];
  priceMin: number;
  priceMax: number;
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean | undefined;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
      >
        {title}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function ProductFilters({ categories, brands, priceMin, priceMax }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const currentBrands = searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const currentMinPrice = Number(searchParams.get("minPrice") ?? priceMin);
  const currentMaxPrice = Number(searchParams.get("maxPrice") ?? priceMax);
  const inStockOnly = searchParams.get("inStock") === "1";
  const hasDiscount = searchParams.get("hasDiscount") === "1";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentBrands);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [stockOnly, setStockOnly] = useState(inStockOnly);
  const [discountOnly, setDiscountOnly] = useState(hasDiscount);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset page
    params.delete("page");

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    } else {
      params.delete("category");
    }
    if (selectedBrands.length > 0) {
      params.set("brand", selectedBrands.join(","));
    } else {
      params.delete("brand");
    }
    if (minPrice > priceMin) {
      params.set("minPrice", String(minPrice));
    } else {
      params.delete("minPrice");
    }
    if (maxPrice < priceMax) {
      params.set("maxPrice", String(maxPrice));
    } else {
      params.delete("maxPrice");
    }
    if (stockOnly) {
      params.set("inStock", "1");
    } else {
      params.delete("inStock");
    }
    if (discountOnly) {
      params.set("hasDiscount", "1");
    } else {
      params.delete("hasDiscount");
    }

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
    setMobileOpen(false);
  }, [searchParams, selectedCategories, selectedBrands, minPrice, maxPrice, stockOnly, discountOnly, priceMin, priceMax, router]);

  const resetFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice(priceMin);
    setMaxPrice(priceMax);
    setStockOnly(false);
    setDiscountOnly(false);
    router.push("/products");
    setMobileOpen(false);
  }, [priceMin, priceMax, router]);

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const toggleBrand = useCallback((slug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const filterContent = (
    <div className="space-y-0">
      {/* Categories */}
      {categories.length > 0 && (
        <CollapsibleSection title="Categoria">
          <div className="space-y-2">
            {categories.filter((c) => c.is_active).map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleCategory(cat.slug)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <CollapsibleSection title="Marca">
          <div className="space-y-2">
            {brands.filter((b) => b.is_active).map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                {brand.name}
              </label>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Price range */}
      <CollapsibleSection title="Prezzo">
        <PriceRangeSlider
          min={priceMin}
          max={priceMax}
          currentMin={minPrice}
          currentMax={maxPrice}
          onChange={(newMin, newMax) => {
            setMinPrice(newMin);
            setMaxPrice(newMax);
          }}
        />
      </CollapsibleSection>

      {/* Availability */}
      <CollapsibleSection title="Disponibilità">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => setStockOnly(e.target.checked)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          Solo disponibili
        </label>
      </CollapsibleSection>

      {/* Discount */}
      <CollapsibleSection title="Promozioni">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => setDiscountOnly(e.target.checked)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          Solo in promozione
        </label>
      </CollapsibleSection>

      {/* Action buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          Applica filtri
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm lg:hidden"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm4 8a1 1 0 011-1h8a1 1 0 010 2H8a1 1 0 01-1-1zm2 8a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
        </svg>
        Filtri
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] shrink-0 lg:block">
        <h2 className="text-lg font-bold text-gray-900">Filtri</h2>
        {filterContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filtri</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}

export { ProductFilters };
