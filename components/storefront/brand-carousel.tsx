import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface BrandItem {
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface BrandCarouselProps {
  brands: BrandItem[];
}

export function BrandCarousel({ brands }: BrandCarouselProps) {
  if (brands.length === 0) return null;

  return (
    <section className="border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl uppercase text-red-700">
          I nostri brand
        </h2>
        {/* Desktop: 6-col grid, Mobile: horizontal scroll */}
        <div className="mt-8 hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/products?brand=${brand.slug}`}
              className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md hover:border-red-300"
            >
              {brand.logoUrl ? (
                <OptimizedImage
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={120}
                  height={48}
                  className="h-12 max-w-full object-contain"
                  sizes="120px"
                />
              ) : (
                <span className="text-sm font-semibold text-neutral-700">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 sm:hidden">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/products?brand=${brand.slug}`}
              className="flex flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-4 hover:shadow-md"
            >
              {brand.logoUrl ? (
                <OptimizedImage
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={100}
                  height={40}
                  className="h-10 object-contain"
                  sizes="100px"
                />
              ) : (
                <span className="text-sm font-semibold text-neutral-700 whitespace-nowrap">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
