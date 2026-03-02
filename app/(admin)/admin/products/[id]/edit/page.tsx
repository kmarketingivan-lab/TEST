import { requireAdmin } from "@/lib/auth/helpers";
import { getProductById } from "@/lib/dal/products";
import { getCategories } from "@/lib/dal/categories";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../../product-form";
import { updateProduct } from "../../actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const [productResult, categories, brandsResult] = await Promise.all([
    getProductById(id),
    getCategories(),
    supabase.from("brands").select("id, name").eq("is_active", true).order("name"),
  ]);

  if (!productResult) notFound();

  // Fetch the full product row including extra fields (specifications, regulatory_info, brand_id)
  const { data: fullProduct } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  const product = fullProduct as Record<string, unknown> | null;
  if (!product) notFound();

  const brands = (brandsResult.data ?? []) as { id: string; name: string }[];

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateProduct(id, formData);
  }

  const productForForm = {
    ...productResult,
    specifications: (product.specifications as Record<string, string>) ?? null,
    regulatory_info: (product.regulatory_info as string) ?? null,
    brand_id: (product.brand_id as string) ?? null,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modifica prodotto</h1>
      <ProductForm product={productForForm} categories={categories} brands={brands} action={handleUpdate} />
    </div>
  );
}
