import Link from "next/link";
import type { Metadata } from "next";
import { getFeaturedProducts, getProducts } from "@/lib/dal/products";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { getCategoryTree } from "@/lib/dal/categories";
import { ProductCard } from "@/components/storefront/product-card";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { TrustBadges } from "@/components/storefront/trust-badges";
import { BrandCarousel } from "@/components/storefront/brand-carousel";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { generateLocalBusinessSchema, generateOrganizationSchema } from "@/lib/seo/json-ld";
import { generateCanonicalUrl } from "@/lib/seo/metadata";
import { Star, MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Armeria Palmetto | Armi, Munizioni e Fuochi Artificiali a Brescia",
  description:
    "Armeria Palmetto: vendita armi, munizioni, accessori e fuochi artificiali a Brescia. Ampia scelta, consulenza esperta e spedizione in tutta Italia.",
  alternates: {
    canonical: generateCanonicalUrl("/"),
  },
  openGraph: {
    title: "Armeria Palmetto | Armi, Munizioni e Fuochi Artificiali a Brescia",
    description:
      "Vendita armi, munizioni, accessori e fuochi artificiali a Brescia. Consulenza esperta.",
    url: generateCanonicalUrl("/"),
    type: "website",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Armeria Palmetto - Negozio di armi a Brescia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Armeria Palmetto | Armi, Munizioni e Fuochi Artificiali a Brescia",
    description:
      "Vendita armi, munizioni, accessori e fuochi artificiali a Brescia.",
  },
};

const testimonials = [
  {
    name: "Marco R.",
    text: "Prodotti eccellenti e spedizione velocissima. Sono cliente da anni e non sono mai rimasto deluso.",
    rating: 5,
  },
  {
    name: "Laura B.",
    text: "Assistenza impeccabile, mi hanno aiutato a scegliere il prodotto perfetto per le mie esigenze.",
    rating: 5,
  },
  {
    name: "Giuseppe T.",
    text: "Qualità e professionalità. Il negozio di riferimento per chi cerca il meglio. Consigliatissimo!",
    rating: 5,
  },
];

export default async function HomePage() {
  const [featuredProducts, categoryTree, newArrivals] = await Promise.all([
    getFeaturedProducts(8),
    getCategoryTree(),
    getProducts({
      sortBy: "created_at",
      sortOrder: "desc",
      isActive: true,
      perPage: 8,
    }),
  ]);

  const activeCategories = categoryTree.filter((c) => c.is_active);

  // Brands: try DAL (from Stream A), fallback to empty
  let brands: { name: string; slug: string; logoUrl?: string | null }[] = [];
  try {
    const { getBrands } = await import("@/lib/dal/brands");
    const dbBrands = await getBrands();
    brands = dbBrands.map((b: { name: string; slug: string; logo_url?: string | null }) => ({
      name: b.name,
      slug: b.slug,
      logoUrl: b.logo_url ?? null,
    }));
  } catch {
    // DAL not available yet — skip brands section
  }

  // Discounted products
  let discountedProducts: Product[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .not("compare_at_price", "is", null)
      .order("created_at", { ascending: false })
      .limit(4);
    discountedProducts = (data ?? []) as Product[];
  } catch {
    // ignore
  }

  return (
    <div>
      <JsonLdScript
        data={generateLocalBusinessSchema({
          name: "Armeria Palmetto",
          description: "Vendita armi, munizioni, fuochi artificiali a Brescia",
          phone: "+39 0123 456789",
          email: "info@myecommerce.it",
          address: {
            street: "Via Roma 123",
            city: "Roma",
            province: "RM",
            postalCode: "00100",
            country: "IT",
          },
          openingHours: [
            "Mo-Fr 09:00-13:00",
            "Mo-Fr 15:00-19:00",
            "Sa 09:00-13:00",
          ],
        })}
      />
      <JsonLdScript
        data={generateOrganizationSchema({
          name: "Armeria Palmetto",
          email: "info@myecommerce.it",
          phone: "+39 0123 456789",
        })}
      />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl uppercase text-red-700">Prodotti in evidenza</h2>
            <Link
              href="/products"
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Vedi tutti &rarr;
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.data.length > 0 && (
        <section className="bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl uppercase text-red-700">Nuovi arrivi</h2>
              <Link
                href="/products?sort=created_at&order=desc"
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Vedi tutti &rarr;
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {newArrivals.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo / Discounted Products */}
      {discountedProducts.length > 0 && (
        <section className="bg-red-950">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold uppercase text-white">
                Offerte
              </h2>
              <Link
                href="/products"
                className="text-sm font-semibold text-red-300 hover:text-white"
              >
                Vedi tutte &rarr;
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {discountedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands */}
      <BrandCarousel brands={brands} />

      {/* Categories */}
      {activeCategories.length > 0 && (
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl uppercase text-red-700">Le nostre categorie</h2>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {activeCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-6 text-center transition-shadow hover:shadow-lg hover:border-red-300"
                >
                  {category.image_url ? (
                    <div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                      <OptimizedImage
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="h-full w-full object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{category.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl uppercase text-red-700">
            Cosa dicono i nostri clienti
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-neutral-200 bg-white p-6"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm text-neutral-600">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold text-neutral-900">
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bookings CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-yellow-600 p-8 text-white sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Prenota un appuntamento</h2>
            <p className="mt-3 text-yellow-100">
              Scegli il servizio, seleziona la data e l&apos;orario che preferisci. Facile e veloce.
            </p>
            <Link
              href="/bookings"
              className="mt-6 inline-flex items-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              Prenota ora
            </Link>
          </div>
        </div>
      </section>
      {/* Newsletter */}
      <NewsletterForm />

      {/* Store Info */}
      <section className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl uppercase text-red-500">
            Il nostro negozio
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                <div>
                  <p className="font-semibold">Indirizzo</p>
                  <p className="text-sm text-neutral-400">
                    Via Roma 123, 00100 Roma (RM)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                <div>
                  <p className="font-semibold">Orari</p>
                  <p className="text-sm text-neutral-400">
                    Lun-Ven: 9:00-13:00 / 15:00-19:00
                  </p>
                  <p className="text-sm text-neutral-400">
                    Sabato: 9:00-13:00
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                <div>
                  <p className="font-semibold">Telefono</p>
                  <p className="text-sm text-neutral-400">
                    +39 0123 456789
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-neutral-400">
                    info@myecommerce.it
                  </p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="flex items-center justify-center rounded-lg bg-neutral-800 min-h-[250px]">
              <div className="text-center text-neutral-500">
                <MapPin className="mx-auto h-10 w-10" />
                <p className="mt-2 text-sm">Google Maps</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
