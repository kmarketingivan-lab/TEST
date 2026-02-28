import { requireAdmin } from "@/lib/auth/helpers";
import { getCategoryTree } from "@/lib/dal/categories";
import { CategoriesTree } from "./categories-tree";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const tree = await getCategoryTree();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categorie</h1>
        <a
          href="/admin/categories/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuova categoria
        </a>
      </div>
      <CategoriesTree tree={tree} />
    </div>
  );
}
