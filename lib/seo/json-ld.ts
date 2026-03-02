import type { Product, BlogPost, Review } from "@/types/database";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armeriapalmetto.it";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BusinessSettings {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  openingHours?: string[];
  logo?: string;
}

export function generateProductSchema(
  product: Product & { images?: { url: string; alt_text: string | null }[] },
  reviews?: Review[]
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    url: `${siteUrl}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EUR",
      availability: product.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  if (product.images && product.images.length > 0) {
    schema.image = product.images.map((img) => img.url);
  }

  if (reviews && reviews.length > 0) {
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
    };
    schema.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author_name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
      },
      reviewBody: r.body ?? undefined,
    }));
  }

  return schema;
}

export function generateLocalBusinessSchema(
  settings: BusinessSettings
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.name ?? "Armeria Palmetto",
    description: settings.description ?? "Vendita armi, munizioni, fuochi artificiali a Brescia",
    url: siteUrl,
    telephone: settings.phone ?? undefined,
    email: settings.email ?? undefined,
    ...(settings.logo ? { logo: settings.logo } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address?.street ?? undefined,
      addressLocality: settings.address?.city ?? "Brescia",
      addressRegion: settings.address?.province ?? "BS",
      postalCode: settings.address?.postalCode ?? undefined,
      addressCountry: settings.address?.country ?? "IT",
    },
    ...(settings.openingHours ? { openingHours: settings.openingHours } : {}),
  };
}

export function generateBreadcrumbSchema(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

export function generateBlogPostSchema(
  post: BlogPost,
  author?: { name: string } | null
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    ...(post.cover_image_url ? { image: post.cover_image_url } : {}),
    ...(author ? { author: { "@type": "Person", name: author.name } } : {}),
    publisher: {
      "@type": "Organization",
      name: "Armeria Palmetto",
      url: siteUrl,
    },
  };
}

export function generateOrganizationSchema(
  settings: BusinessSettings
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name ?? "Armeria Palmetto",
    url: siteUrl,
    ...(settings.logo ? { logo: settings.logo } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
  };
}
