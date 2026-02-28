import { requireAdmin } from "@/lib/auth/helpers";
import { getCategories } from "@/lib/dal/categories";
import { CategoryForm } from "../category-form";
import { createCategory } from "../actions";

export default async function NewCategoryPage() {
  await requireAdmin();
  const categories = await getCategories();
  const parentOptions = categories
    .filter((c) => !c.parent_id)
    .map((c) => ({ label: c.name, value: c.id }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuova categoria</h1>
      <CategoryForm parentOptions={parentOptions} action={createCategory} />
    </div>
  );
}
