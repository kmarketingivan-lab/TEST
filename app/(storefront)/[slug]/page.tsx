import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/dal/pages";
import { RichTextDisplay } from "@/components/ui/rich-text-display";

interface StaticPageProps {
  params: Promise<{ slug: string }>;
}

/** Reserved slugs that should not match the catch-all page route. */
const RESERVED_SLUGS = new Set([
  "products",
  "cart",
  "checkout",
  "blog",
  "bookings",
  "account",
  "auth",
]);

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};

  const page = await getPageBySlug(slug);
  if (!page) return { title: "Pagina non trovata" };

  return {
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? undefined,
  };
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;

  if (RESERVED_SLUGS.has(slug)) notFound();

  const page = await getPageBySlug(slug);

  if (!page || !page.is_published) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>

      <div className="mt-8">
        {page.rich_content ? (
          <RichTextDisplay html={page.rich_content} />
        ) : page.content ? (
          <div className="prose max-w-none text-gray-700">{page.content}</div>
        ) : null}
      </div>
    </div>
  );
}
