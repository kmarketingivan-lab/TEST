import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { Heart } from "lucide-react";
import { WishlistItems } from "./wishlist-items";
import type { Product } from "@/types/database";

interface WishlistItemWithProduct {
  id: string;
  product_id: string;
  product: Pick<Product, "name" | "price" | "slug" | "stock_quantity"> & {
    product_images: { url: string; is_primary: boolean }[];
  };
}

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const perPage = 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createClient();

  const { data, count } = await supabase
    .from("wishlists")
    .select(
      "id, product_id, product:products(name, price, slug, stock_quantity, product_images(url, is_primary))",
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const items = (data ?? []) as unknown as WishlistItemWithProduct[];
  const totalPages = Math.ceil((count ?? 0) / perPage);

  if (items.length === 0 && page === 1) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16">
          <Heart className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-600">La tua wishlist è vuota</p>
          <Link
            href="/products"
            className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Esplora il catalogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
      <p className="mt-1 text-sm text-gray-600">
        {count ?? 0} prodott{(count ?? 0) === 1 ? "o" : "i"} salvat{(count ?? 0) === 1 ? "o" : "i"}
      </p>

      <div className="mt-6">
        <WishlistItems items={items} />
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/account/wishlist?page=${page - 1}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Precedente
            </Link>
          )}
          <span className="text-sm text-gray-600">
            Pagina {page} di {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/account/wishlist?page=${page + 1}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Successiva
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
