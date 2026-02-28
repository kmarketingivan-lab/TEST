import { requireAdmin } from "@/lib/auth/helpers";
import { getProductById } from "@/lib/dal/products";
import { Badge } from "@/components/ui/badge";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <Link
          href={`/admin/products/${id}/edit`}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Modifica
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Informazioni</h2>
          <dl className="space-y-3">
            <DetailRow label="Slug" value={product.slug} />
            <DetailRow label="SKU" value={product.sku ?? "—"} />
            <DetailRow label="Barcode" value={product.barcode ?? "—"} />
            <DetailRow label="Prezzo" value={`€${product.price.toFixed(2)}`} />
            {product.compare_at_price && (
              <DetailRow label="Prezzo precedente" value={`€${product.compare_at_price.toFixed(2)}`} />
            )}
            {product.cost_price && (
              <DetailRow label="Costo" value={`€${product.cost_price.toFixed(2)}`} />
            )}
            <DetailRow label="Stock" value={String(product.stock_quantity)} />
            <DetailRow label="Peso" value={product.weight_grams ? `${product.weight_grams}g` : "—"} />
            <div className="flex items-center gap-2">
              <dt className="text-sm text-gray-500">Stato:</dt>
              <dd>
                <Badge variant={product.is_active ? "success" : "error"}>
                  {product.is_active ? "Attivo" : "Inattivo"}
                </Badge>
              </dd>
            </div>
            {product.is_featured && (
              <div className="flex items-center gap-2">
                <dt className="text-sm text-gray-500">In evidenza:</dt>
                <dd><Badge variant="info">In evidenza</Badge></dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Descrizione</h2>
          {product.description && (
            <p className="mb-4 text-sm text-gray-600">{product.description}</p>
          )}
          {product.rich_description && (
            <RichTextDisplay html={product.rich_description} />
          )}
          {!product.description && !product.rich_description && (
            <p className="text-sm text-gray-400">Nessuna descrizione</p>
          )}
        </div>
      </div>

      {/* SEO */}
      {(product.seo_title || product.seo_description) && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">SEO</h2>
          <dl className="space-y-3">
            {product.seo_title && <DetailRow label="Titolo" value={product.seo_title} />}
            {product.seo_description && <DetailRow label="Descrizione" value={product.seo_description} />}
          </dl>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-sm text-gray-500 min-w-[120px]">{label}:</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}
