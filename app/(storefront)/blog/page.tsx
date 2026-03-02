import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { generateCanonicalUrl } from "@/lib/seo/metadata";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BlogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getFilteredPosts(options: {
  page: number;
  perPage: number;
  tag: string | undefined;
  search: string | undefined;
}): Promise<{ data: BlogPost[]; count: number }> {
  const { page, perPage, tag, search } = options;
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  if (tag) {
    query = query.contains("tags", [tag]);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  query = query.order("published_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data: (data ?? []) as BlogPost[], count: count ?? 0 };
}

async function getAllTags(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("tags")
    .eq("is_published", true);

  if (!data) return [];

  const tagCounts = new Map<string, number>();
  for (const post of data as { tags: string[] }[]) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const tag = typeof params["tag"] === "string" ? params["tag"] : undefined;
  const page = Number(params["page"] ?? 1);

  const title = tag ? `Blog — ${tag}` : "Blog";
  const description =
    "Articoli, guide e novita dal mondo delle armi, munizioni e accessori. Il blog di Armeria Palmetto.";
  const canonical = generateCanonicalUrl(page > 1 ? `/blog?page=${page}` : "/blog");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params["page"] ?? 1);
  const tag = typeof params["tag"] === "string" ? params["tag"] : undefined;
  const search = typeof params["search"] === "string" ? params["search"] : undefined;
  const perPage = 9;

  const [{ data: posts, count }, allTags] = await Promise.all([
    getFilteredPosts({ page, perPage, tag, search }),
    getAllTags(),
  ]);
  const totalPages = Math.ceil(count / perPage);

  const isFiltered = !!(tag || search);

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (tag) sp.set("tag", tag);
    if (search) sp.set("search", search);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold uppercase text-red-700">Blog</h1>

      {/* Search bar and tag chips */}
      <div className="mt-6 space-y-4">
        <form action="/blog" method="GET" className="flex gap-2">
          {tag && <input type="hidden" name="tag" value={tag} />}
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Cerca articoli..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Cerca
          </button>
        </form>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 12).map((t) => (
              <Link
                key={t}
                href={tag === t ? `/blog${search ? `?search=${search}` : ""}` : `/blog?tag=${t}${search ? `&search=${search}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  tag === t
                    ? "bg-red-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active filter indicator */}
      {isFiltered && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span>
            {tag && search
              ? `Risultati per tag "${tag}" e ricerca "${search}"`
              : tag
                ? `Risultati per tag "${tag}"`
                : `Risultati per "${search}"`}
            {` (${count})`}
          </span>
          <Link href="/blog" className="text-red-600 hover:text-red-700 underline">
            Mostra tutti
          </Link>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {/* Cover image */}
              {post.cover_image_url ? (
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <OptimizedImage
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gray-100 text-gray-400">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              )}

              <div className="p-5">
                {/* Date and tags */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {format(new Date(post.published_at), "d MMMM yyyy", { locale: it })}
                    </time>
                  )}
                  {post.tags.length > 0 && (
                    <>
                      <span>&middot;</span>
                      <span>{post.tags.slice(0, 2).join(", ")}</span>
                    </>
                  )}
                </div>

                <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center text-gray-500">
          <p className="text-lg">
            {isFiltered ? "Nessun risultato trovato" : "Nessun articolo pubblicato"}
          </p>
          {isFiltered && (
            <Link href="/blog" className="mt-2 inline-block text-red-600 hover:text-red-700 underline">
              Torna al blog
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Precedente
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildPageUrl(p)}
              className={`rounded-lg px-3 py-2 text-sm ${p === page ? "bg-red-700 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Successiva
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
