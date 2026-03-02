import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";

async function getPopularPosts(limit: number): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as BlogPost[];
}

async function getSidebarTags(): Promise<string[]> {
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

export async function BlogSidebar() {
  const [popularPosts, tags] = await Promise.all([
    getPopularPosts(5),
    getSidebarTags(),
  ]);

  return (
    <aside className="space-y-8">
      {/* Popular posts */}
      {popularPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Articoli popolari
          </h3>
          <ul className="mt-3 space-y-3">
            {popularPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex gap-3"
                >
                  {post.cover_image_url ? (
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <img
                        src={post.cover_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-100">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-sm text-gray-700 group-hover:text-red-600 line-clamp-2">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags cloud */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
            Tags
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Compact search form */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
          Cerca
        </h3>
        <form action="/blog" method="GET" className="mt-3">
          <div className="flex gap-2">
            <input
              type="search"
              name="search"
              placeholder="Cerca..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
