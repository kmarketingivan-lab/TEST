import Link from "next/link";
import { getPublishedPosts } from "@/lib/dal/blog";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BlogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params["page"] ?? 1);
  const perPage = 9;

  const { data: posts, count } = await getPublishedPosts({ page, perPage });
  const totalPages = Math.ceil(count / perPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Blog</h1>

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

                <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
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
          <p className="text-lg">Nessun articolo pubblicato</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Precedente
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`rounded-lg px-3 py-2 text-sm ${p === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
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
