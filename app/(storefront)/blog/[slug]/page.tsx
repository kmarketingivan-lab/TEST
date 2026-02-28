import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/dal/blog";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post non trovato" };

  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.is_published) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
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
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header>
        <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
          {post.published_at && (
            <time dateTime={post.published_at}>
              {format(new Date(post.published_at), "d MMMM yyyy", { locale: it })}
            </time>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {tag}
              </span>
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

      {/* Back link */}
      <div className="mt-12 border-t border-gray-200 pt-6">
        <Link href="/blog" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          &larr; Torna al blog
        </Link>
      </div>
    </article>
  );
}
