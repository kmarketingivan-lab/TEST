import { requireAdmin } from "@/lib/auth/helpers";
import { getCategoryTree } from "@/lib/dal/categories";
import { CategoriesTree } from "./categories-tree";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const tree = await getCategoryTree();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categorie</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nuova categoria
        </Link>
      </div>
      <CategoriesTree tree={tree} />
    </div>
  );
}
