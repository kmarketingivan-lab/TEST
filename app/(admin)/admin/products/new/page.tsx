import { requireAdmin } from "@/lib/auth/helpers";
import { getCategories } from "@/lib/dal/categories";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [categories, brandsResult] = await Promise.all([
    getCategories(),
    supabase.from("brands").select("id, name").eq("is_active", true).order("name"),
  ]);

  const brands = (brandsResult.data ?? []) as { id: string; name: string }[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuovo prodotto</h1>
      <ProductForm categories={categories} brands={brands} action={createProduct} />
    </div>
  );
}
