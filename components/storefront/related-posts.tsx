import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { format } from "date-fns";
import { it } from "date-fns/locale";

async function getRelatedPosts(postId: string, tags: string[], limit: number): Promise<BlogPost[]> {
  const supabase = await createClient();

  if (tags.length === 0) {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .neq("id", postId)
      .order("published_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as BlogPost[];
  }

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .neq("id", postId)
    .overlaps("tags", tags)
    .order("published_at", { ascending: false })
    .limit(limit);

  const posts = (data ?? []) as BlogPost[];

  if (posts.length < limit) {
    const existingIds = [postId, ...posts.map((p) => p.id)];
    const { data: extra } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .not("id", "in", `(${existingIds.join(",")})`)
      .order("published_at", { ascending: false })
      .limit(limit - posts.length);
    if (extra) posts.push(...(extra as BlogPost[]));
  }

  return posts;
}

interface RelatedPostsProps {
  postId: string;
  tags: string[];
}

export async function RelatedPosts({ postId, tags }: RelatedPostsProps) {
  const posts = await getRelatedPosts(postId, tags, 3);

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-gray-900">Articoli correlati</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
          >
            {post.cover_image_url ? (
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <OptimizedImage
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-100 text-gray-400">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
            <div className="p-4">
              {post.published_at && (
                <p className="text-xs text-gray-500">
                  {format(new Date(post.published_at), "d MMMM yyyy", { locale: it })}
                </p>
              )}
              <h3 className="mt-1 text-sm font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
