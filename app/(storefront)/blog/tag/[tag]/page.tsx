import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getPostsByTag(
  tag: string,
  page: number,
  perPage: number
): Promise<{ data: BlogPost[]; count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .contains("tags", [tag])
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: (data ?? []) as BlogPost[], count: count ?? 0 };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `Articoli con tag: ${decodedTag}`,
    description: `Tutti gli articoli del blog con il tag "${decodedTag}"`,
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const sp = await searchParams;
  const decodedTag = decodeURIComponent(tag);
  const page = Number(sp["page"] ?? 1);
  const perPage = 9;

  const { data: posts, count } = await getPostsByTag(decodedTag, page, perPage);
  const totalPages = Math.ceil(count / perPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-gray-700">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Tag: {decodedTag}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900">
        Articoli con tag: <span className="text-red-700">{decodedTag}</span>
      </h1>
      <p className="mt-2 text-sm text-gray-500">{count} articol{count === 1 ? "o" : "i"} trovat{count === 1 ? "o" : "i"}</p>

      {posts.length > 0 ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {post.cover_image_url ? (
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
          <p className="text-lg">Nessun articolo trovato con questo tag</p>
          <Link href="/blog" className="mt-2 inline-block text-red-600 hover:text-red-700 underline">
            Torna al blog
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/blog/tag/${encodeURIComponent(decodedTag)}?page=${page - 1}`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Precedente
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog/tag/${encodeURIComponent(decodedTag)}${p > 1 ? `?page=${p}` : ""}`}
              className={`rounded-lg px-3 py-2 text-sm ${p === page ? "bg-red-700 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/blog/tag/${encodeURIComponent(decodedTag)}?page=${page + 1}`}
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
