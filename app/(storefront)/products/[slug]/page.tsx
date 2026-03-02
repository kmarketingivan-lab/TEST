import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/dal/products";
import { getProductReviews, getReviewStats } from "@/lib/dal/reviews";
import { isInWishlist } from "@/lib/dal/wishlists";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, formatPrice } from "@/components/storefront/product-card";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { StockBadge } from "@/components/storefront/stock-badge";
import { ProductTabs } from "@/components/storefront/product-tabs";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { ShareButtons } from "@/components/storefront/share-buttons";
import { ProductDetailClient } from "./product-detail-client";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/json-ld";
import { generateCanonicalUrl } from "@/lib/seo/metadata";
import type { Category } from "@/types/database";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Prodotto non trovato" };

  const title = product.seo_title ?? product.name;
  const description = product.seo_description ?? product.description ?? undefined;
  const canonical = generateCanonicalUrl(`/products/${slug}`);
  const primaryImage = product.product_images.find((img) => img.is_primary)
    ?? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      ...(primaryImage
        ? {
            images: [
              {
                url: primaryImage.url,
                alt: primaryImage.alt_text ?? product.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(primaryImage ? { images: [primaryImage.url] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.is_active) notFound();

  const variants = product.product_variants.filter((v) => v.is_active);

  // Fetch data in parallel
  const [related, reviewData, reviewStats, user] = await Promise.all([
    getRelatedProducts(product.id, product.category_id, 4),
    getProductReviews(product.id, { page: 1, perPage: 10 }),
    getReviewStats(product.id),
    getCurrentUser(),
  ]);

  // Check wishlist status
  const inWishlist = user ? await isInWishlist(user.id, product.id) : false;

  // Get category for breadcrumb
  let category: Category | null = null;
  if (product.category_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("id", product.category_id)
      .single();
    category = (data as Category | null) ?? null;
  }

  const hasDiscount =
    product.compare_at_price !== null && product.compare_at_price > product.price;

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLdScript
        data={generateProductSchema(
          {
            ...product,
            images: product.product_images.map((img) => ({
              url: img.url,
              alt_text: img.alt_text,
            })),
          },
          reviewData.data
        )}
      />
      <JsonLdScript
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Catalogo", url: "/products" },
          ...(category
            ? [{ name: category.name, url: `/products?category=${category.slug}` }]
            : []),
          { name: product.name, url: `/products/${product.slug}` },
        ])}
      />
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-gray-700">Catalogo</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${category.slug}`} className="hover:text-gray-700">
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Gallery */}
        <ProductGallery images={product.product_images} productName={product.name} />

        {/* Right: Product info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.sku && (
              <p className="mt-1 text-sm text-gray-500">SKU: {product.sku}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-red-700">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && product.compare_at_price !== null && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock badge */}
          <StockBadge
            stockQuantity={product.stock_quantity}
            lowStockThreshold={product.low_stock_threshold ?? undefined}
          />

          {/* Description */}
          {product.description && (
            <p className="text-gray-700">{product.description}</p>
          )}

          {/* Age restriction warning for pyrotechnics */}
          {product.product_type === "fuochi_artificiali" && (
            <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-800">
                ⚠️ Vendita riservata a maggiori di 18 anni
              </p>
              <p className="mt-1 text-xs text-yellow-700">
                Confermando l&apos;acquisto dichiari di avere almeno 18 anni e di essere autorizzato
                all&apos;acquisto di materiale pirotecnico ai sensi del D.Lgs. 123/2015.
              </p>
            </div>
          )}

          {/* Client interactive section: variants + quantity + add to cart */}
          <ProductDetailClient
            productId={product.id}
            basePrice={product.price}
            stockQuantity={product.stock_quantity}
            variants={variants}
            requiresAgeVerification={product.product_type === "fuochi_artificiali"}
          />

          {/* Wishlist + Share */}
          <div className="flex flex-wrap items-center gap-3">
            <WishlistButton
              productId={product.id}
              isInWishlist={inWishlist}
              isLoggedIn={user !== null}
            />
            <ShareButtons url={productUrl} title={product.name} />
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Regulatory, Reviews */}
      <div className="mt-12">
        <ProductTabs
          richDescription={product.rich_description}
          specifications={product.specifications}
          regulatoryInfo={product.regulatory_info}
          productId={product.id}
          reviews={reviewData.data}
          reviewStats={reviewStats}
          reviewTotalCount={reviewData.count}
          isLoggedIn={user !== null}
        />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Prodotti correlati</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
