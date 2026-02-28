import { requireAdmin } from "@/lib/auth/helpers";
import { getProducts } from "@/lib/dal/products";
import { getCategories } from "@/lib/dal/categories";
import { ProductsTable } from "./products-table";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";
  const categoryId = typeof params.category === "string" ? params.category : "";

  const getProductsOpts: Parameters<typeof getProducts>[0] = { page, perPage: 20 };
  if (search) getProductsOpts.search = search;
  if (categoryId) getProductsOpts.categoryId = categoryId;

  const [productsResult, categories] = await Promise.all([
    getProducts(getProductsOpts),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prodotti</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuovo prodotto
        </Link>
      </div>

      <ProductsTable
        products={productsResult.data}
        totalCount={productsResult.count}
        page={page}
        categories={categories}
        currentSearch={search}
        currentCategory={categoryId}
      />
    </div>
  );
}
