import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getCategoryTree } from "@/lib/dal/categories";
import { getBrands } from "@/lib/dal/brands";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ViewToggle } from "@/components/storefront/view-toggle";
import { StockBadge } from "@/components/storefront/stock-badge";
import { formatPrice } from "@/components/storefront/product-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { generateCanonicalUrl } from "@/lib/seo/metadata";
import type { Product, ProductImage } from "@/types/database";

type ProductWithImages = Product & { product_images: ProductImage[] };

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStringParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const val = params[key];
  return typeof val === "string" ? val : "";
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number(params["page"] ?? 1));
  const categoryParam = typeof params["category"] === "string" ? params["category"] : "";

  const title = categoryParam
    ? `${categoryParam} — Catalogo`
    : "Catalogo Prodotti";
  const description =
    "Sfoglia il catalogo completo di armi, munizioni, accessori e fuochi artificiali di Armeria Palmetto.";
  const canonical = generateCanonicalUrl(page > 1 ? `/products?page=${page}` : "/products");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params["page"] ?? 1));
  const search = getStringParam(params, "search");
  const categoryParam = getStringParam(params, "category");
  const sortBy = getStringParam(params, "sort") || "created_at";
  const sortOrder = getStringParam(params, "order") || "desc";
  const brandParam = getStringParam(params, "brand");
  const minPriceParam = getStringParam(params, "minPrice");
  const maxPriceParam = getStringParam(params, "maxPrice");
  const inStockParam = getStringParam(params, "inStock");
  const hasDiscountParam = getStringParam(params, "hasDiscount");
  const perPageParam = getStringParam(params, "perPage");
  const viewParam = getStringParam(params, "view");

  const perPage = [12, 24, 48].includes(Number(perPageParam)) ? Number(perPageParam) : 12;
  const view: "grid" | "list" = viewParam === "list" ? "list" : "grid";

  // Fetch filter data in parallel
  const [allCategories, brands, supabase] = await Promise.all([
    getCategories(),
    getBrands({ isActive: true }),
    createClient(),
  ]);

  const activeCategories = allCategories.filter((c) => c.is_active);
  const categoryTree = await getCategoryTree();

  // Selected categories
  const categorySlugs = categoryParam ? categoryParam.split(",").filter(Boolean) : [];
  const selectedCategories = categorySlugs
    .map((slug) => activeCategories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  // Subcategories for selected category
  const selectedParentCategory = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
  const subcategories = selectedParentCategory
    ? activeCategories.filter((c) => c.parent_id === selectedParentCategory.id)
    : [];

  // Get price range
  const { data: priceRange } = await supabase
    .from("products")
    .select("price")
    .eq("is_active", true)
    .order("price", { ascending: true });

  const prices = (priceRange ?? []).map((p) => (p as { price: number }).price);
  const globalMinPrice = prices[0] ?? 0;
  const globalMaxPrice = prices[prices.length - 1] ?? 1000;

  // Build product query
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("products")
    .select("*, product_images(*)", { count: "exact" })
    .eq("is_active", true);

  // Category filter
  if (selectedCategories.length > 0) {
    const catIds = selectedCategories.map((c) => c.id);
    // Also include children of selected categories
    const allCatIds = [...catIds];
    for (const catId of catIds) {
      const children = activeCategories.filter((c) => c.parent_id === catId);
      for (const child of children) {
        allCatIds.push(child.id);
      }
    }
    query = query.in("category_id", allCatIds);
  }

  // Brand filter
  if (brandParam) {
    const brandSlugs = brandParam.split(",").filter(Boolean);
    const brandIds = brandSlugs
      .map((slug) => brands.find((b) => b.slug === slug))
      .filter((b): b is NonNullable<typeof b> => b !== undefined)
      .map((b) => b.id);
    if (brandIds.length > 0) {
      query = query.in("brand_id", brandIds);
    }
  }

  // Search
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Price range filter
  if (minPriceParam) {
    query = query.gte("price", Number(minPriceParam));
  }
  if (maxPriceParam) {
    query = query.lte("price", Number(maxPriceParam));
  }

  // In stock only
  if (inStockParam === "1") {
    query = query.gt("stock_quantity", 0);
  }

  // Has discount
  if (hasDiscountParam === "1") {
    query = query.not("compare_at_price", "is", null);
  }

  // Sort
  const validSort = (["name", "price", "created_at"] as const).includes(sortBy as "name" | "price" | "created_at")
    ? (sortBy as "name" | "price" | "created_at")
    : ("created_at" as const);
  const validOrder = sortOrder === "asc" ? "asc" : "desc";

  query = query.order(validSort, { ascending: validOrder === "asc" });
  query = query.range(from, to);

  const { data: rawProducts, count: rawCount } = await query;
  const products = (rawProducts ?? []) as unknown as ProductWithImages[];
  const count = rawCount ?? 0;
  const totalPages = Math.ceil(count / perPage);

  /** Build URL with updated params */
  function buildUrl(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (categoryParam) p.set("category", categoryParam);
    if (brandParam) p.set("brand", brandParam);
    if (sortBy !== "created_at") p.set("sort", sortBy);
    if (sortOrder !== "desc") p.set("order", sortOrder);
    if (minPriceParam) p.set("minPrice", minPriceParam);
    if (maxPriceParam) p.set("maxPrice", maxPriceParam);
    if (inStockParam) p.set("inStock", inStockParam);
    if (hasDiscountParam) p.set("hasDiscount", hasDiscountParam);
    if (perPage !== 12) p.set("perPage", String(perPage));
    if (view !== "grid") p.set("view", view);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold uppercase text-red-700">Catalogo</h1>

      {/* Top bar: search, sort, per-page, view toggle */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* Search */}
        <form action="/products" method="GET" className="flex-1">
          {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Cerca prodotti..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </form>

        {/* Sort */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Ordina:</span>
          <Link
            href={buildUrl({ sort: "created_at", order: "desc", page: "" })}
            className={`rounded px-2 py-1 ${sortBy === "created_at" ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-100"}`}
          >
            Recenti
          </Link>
          <Link
            href={buildUrl({ sort: "price", order: "asc", page: "" })}
            className={`rounded px-2 py-1 ${sortBy === "price" && sortOrder === "asc" ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-100"}`}
          >
            Prezzo &uarr;
          </Link>
          <Link
            href={buildUrl({ sort: "price", order: "desc", page: "" })}
            className={`rounded px-2 py-1 ${sortBy === "price" && sortOrder === "desc" ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-100"}`}
          >
            Prezzo &darr;
          </Link>
          <Link
            href={buildUrl({ sort: "name", order: "asc", page: "" })}
            className={`rounded px-2 py-1 ${sortBy === "name" ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-100"}`}
          >
            Nome
          </Link>
        </div>

        {/* Per page */}
        <div className="flex items-center gap-1 text-sm text-gray-600">
          {[12, 24, 48].map((n) => (
            <Link
              key={n}
              href={buildUrl({ perPage: n === 12 ? "" : String(n), page: "" })}
              className={`rounded px-2 py-1 ${perPage === n ? "bg-red-50 text-red-700 font-semibold" : "hover:bg-gray-100"}`}
            >
              {n}
            </Link>
          ))}
        </div>

        {/* View toggle */}
        <Suspense>
          <ViewToggle currentView={view} />
        </Suspense>
      </div>

      {/* Subcategories chips */}
      {subcategories.length > 0 && selectedParentCategory && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Sottocategorie di {selectedParentCategory.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={buildUrl({ category: sub.slug, page: "" })}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results info */}
      <p className="mt-6 text-sm text-gray-500">
        {count} prodott{count === 1 ? "o" : "i"} trovati
        {search && <> per &ldquo;{search}&rdquo;</>}
        {selectedCategories.length === 1 && selectedParentCategory && <> in {selectedParentCategory.name}</>}
      </p>

      {/* Main layout: sidebar + products */}
      <div className="mt-6 flex gap-8">
        {/* Filters sidebar */}
        <Suspense>
          <ProductFilters
            categories={categoryTree}
            brands={brands}
            priceMin={globalMinPrice}
            priceMax={globalMaxPrice}
          />
        </Suspense>

        {/* Products area */}
        <div className="flex-1">
          {products.length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => {
                  const primaryImage =
                    product.product_images.find((img) => img.is_primary) ??
                    [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
                  const hasDiscount =
                    product.compare_at_price !== null && product.compare_at_price > product.price;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group flex gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {primaryImage ? (
                          <OptimizedImage
                            src={primaryImage.url}
                            alt={primaryImage.alt_text ?? product.name}
                            fill
                            className="h-full w-full object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-red-600">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        )}
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-bold text-red-700">{formatPrice(product.price)}</span>
                          {hasDiscount && product.compare_at_price !== null && (
                            <span className="text-sm text-gray-500 line-through">{formatPrice(product.compare_at_price)}</span>
                          )}
                        </div>
                        <div className="mt-1">
                          <StockBadge stockQuantity={product.stock_quantity} lowStockThreshold={product.low_stock_threshold ?? undefined} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : (
            <div className="mt-12 text-center text-gray-500">
              <p className="text-lg">Nessun prodotto trovato</p>
              <Link href="/products" className="mt-2 inline-block text-sm text-red-600 hover:underline">
                Mostra tutti i prodotti
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Precedente
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev !== undefined && p - prev > 1;
                  return (
                    <span key={p}>
                      {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                      <Link
                        href={buildUrl({ page: String(p) })}
                        className={`rounded-lg px-3 py-2 text-sm ${p === page ? "bg-red-700 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                      >
                        {p}
                      </Link>
                    </span>
                  );
                })}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Successiva
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
