import Link from "next/link";
import { SearchX } from "lucide-react";
import { getFeaturedProducts } from "@/lib/dal/products";
import { ProductCard } from "@/components/storefront/product-card";

export default async function NotFound() {
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  try {
    featured = await getFeaturedProducts(4);
  } catch {
    // DB may not be available
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center px-4 pt-20 text-center">
      <SearchX className="h-20 w-20 text-red-600" />
      <h2 className="mt-6 text-5xl font-bold text-neutral-900">404</h2>
      <p className="mt-3 text-xl font-semibold text-neutral-700">
        Pagina non trovata
      </p>
      <p className="mt-2 max-w-md text-neutral-500">
        La pagina che stai cercando non esiste o potrebbe essere stata spostata.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-800 transition-colors"
        >
          Torna alla home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-full border-2 border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:border-red-300 hover:text-red-700 transition-colors"
        >
          Sfoglia il catalogo
        </Link>
      </div>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mt-16 w-full max-w-5xl">
          <h3 className="text-2xl uppercase text-red-700">
            Potrebbero interessarti
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
