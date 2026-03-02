import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bookings`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/chi-siamo`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contatti`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/servizi`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic: active products
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic: active categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .eq("is_active", true);

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${baseUrl}/products?category=${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic: active brands
  const { data: brands } = await supabase
    .from("brands")
    .select("slug, created_at")
    .eq("is_active", true);

  const brandPages: MetadataRoute.Sitemap = (brands ?? []).map((brand) => ({
    url: `${baseUrl}/products?brand=${brand.slug}`,
    lastModified: brand.created_at ? new Date(brand.created_at) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Dynamic: published blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, tags")
    .eq("is_published", true);

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog tag pages (deduplicated)
  const allTags = new Set<string>();
  (posts ?? []).forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  const tagPages: MetadataRoute.Sitemap = Array.from(allTags).map((tag) => ({
    url: `${baseUrl}/blog?tag=${encodeURIComponent(tag)}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Dynamic: published custom pages
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("is_published", true);

  const customPages: MetadataRoute.Sitemap = (pages ?? []).map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...brandPages,
    ...blogPages,
    ...tagPages,
    ...customPages,
  ];
}
