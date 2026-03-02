import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/dal/blog";
import { createClient } from "@/lib/supabase/server";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { BlogSidebar } from "@/components/storefront/blog-sidebar";
import { RelatedPosts } from "@/components/storefront/related-posts";
import { ShareButtons } from "./share-buttons";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { generateBlogPostSchema, generateBreadcrumbSchema } from "@/lib/seo/json-ld";
import { generateCanonicalUrl } from "@/lib/seo/metadata";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getAuthorProfile(authorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", authorId)
    .single();
  return data as { full_name: string | null; avatar_url: string | null } | null;
}

async function incrementViews(postId: string) {
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_blog_views" as never, { post_id: postId } as never);
  } catch {
    // views column or RPC may not exist yet — silently skip
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post non trovato" };

  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? undefined;
  const canonical = generateCanonicalUrl(`/blog/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(post.updated_at ? { modifiedTime: post.updated_at } : {}),
      ...(post.cover_image_url
        ? { images: [{ url: post.cover_image_url, alt: post.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.cover_image_url ? { images: [post.cover_image_url] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.is_published) notFound();

  // Increment views in background (fire-and-forget)
  void incrementViews(post.id);

  // Fetch author profile if available
  const author = post.author_id ? await getAuthorProfile(post.author_id) : null;

  const postUrl = `/blog/${post.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLdScript
        data={generateBlogPostSchema(
          post,
          author?.full_name ? { name: author.full_name } : null
        )}
      />
      <JsonLdScript
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])}
      />
      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        {/* Main content */}
        <article className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-gray-700">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{post.title}</span>
          </nav>

          {/* Cover image */}
          {post.cover_image_url && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <OptimizedImage
                src={post.cover_image_url}
                alt={post.title}
                width={1200}
                height={630}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            </div>
          )}

          {/* Header */}
          <header>
            <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              {/* Author */}
              {author && (
                <div className="flex items-center gap-2">
                  {author.avatar_url ? (
                    <OptimizedImage
                      src={author.avatar_url}
                      alt={author.full_name ?? "Autore"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-700">
                      {(author.full_name ?? "A").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-700">{author.full_name ?? "Autore"}</span>
                </div>
              )}
              {/* Date */}
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), "d MMMM yyyy", { locale: it })}
                </time>
              )}
            </div>

            {/* Clickable tags */}
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="mt-8">
            {post.rich_content ? (
              <RichTextDisplay html={post.rich_content} />
            ) : post.content ? (
              <div className="prose max-w-none text-gray-700">{post.content}</div>
            ) : null}
          </div>

          {/* Share buttons */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="mb-3 text-sm font-medium text-gray-700">Condividi</p>
            <ShareButtons title={post.title} url={postUrl} />
          </div>

          {/* Related posts */}
          <RelatedPosts postId={post.id} tags={post.tags} />

          {/* Back link */}
          <div className="mt-12 border-t border-gray-200 pt-6">
            <Link href="/blog" className="text-sm font-medium text-red-600 hover:text-red-700">
              &larr; Torna al blog
            </Link>
          </div>
        </article>

        {/* Sidebar - right on desktop, below on mobile */}
        <div className="mt-12 lg:mt-0">
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}
