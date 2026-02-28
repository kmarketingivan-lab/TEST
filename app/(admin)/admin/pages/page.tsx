import { requireAdmin } from "@/lib/auth/helpers";
import { getPages } from "@/lib/dal/pages";
import { PagesTable } from "./pages-table";
import Link from "next/link";

export default async function AdminPagesPage() {
  await requireAdmin();
  const pages = await getPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pagine</h1>
        <Link href="/admin/pages/new" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Nuova pagina
        </Link>
      </div>
      <PagesTable pages={pages} />
    </div>
  );
}
