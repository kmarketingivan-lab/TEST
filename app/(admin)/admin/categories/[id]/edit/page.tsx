import { requireAdmin } from "@/lib/auth/helpers";
import { getCategories } from "@/lib/dal/categories";
import { CategoryForm } from "../../category-form";
import { updateCategory } from "../../actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const categories = await getCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  const parentOptions = categories
    .filter((c) => !c.parent_id && c.id !== id)
    .map((c) => ({ label: c.name, value: c.id }));

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateCategory(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modifica categoria</h1>
      <CategoryForm category={category} parentOptions={parentOptions} action={handleUpdate} />
    </div>
  );
}
