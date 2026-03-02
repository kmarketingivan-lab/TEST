"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { BulkActions } from "@/components/admin/bulk-actions";
import { toggleProductActive, deleteProduct, bulkUpdateProducts, bulkDeleteProducts } from "./actions";
import type { Product, Category } from "@/types/database";

interface ProductsTableProps {
  products: Product[];
  totalCount: number;
  page: number;
  categories: Category[];
  currentSearch?: string;
  currentCategory?: string;
}

type ProductRow = Product & Record<string, unknown>;

/**
 * Client component for the products list with DataTable, search, category filter, bulk actions and actions.
 */
function ProductsTable({
  products,
  totalCount,
  page,
  categories,
  currentSearch,
  currentCategory,
}: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState(currentSearch ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/admin/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateParams("search", searchValue || null);
  }, [updateParams, searchValue]);

  const handleToggle = useCallback(
    async (id: string) => {
      const result = await toggleProductActive(id);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", "Stato aggiornato");
        router.refresh();
      }
    },
    [addToast, router]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteProduct(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Prodotto eliminato");
      router.refresh();
    }
  }, [deleteId, addToast, router]);

  const handleBulkAction = useCallback(
    async (action: "activate" | "deactivate" | "delete", ids: string[]) => {
      let result: { success: boolean } | { error: string };
      if (action === "activate") {
        result = await bulkUpdateProducts(ids, true);
      } else if (action === "deactivate") {
        result = await bulkUpdateProducts(ids, false);
      } else {
        result = await bulkDeleteProducts(ids);
      }
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", "Operazione completata");
        setSelectedIds([]);
        router.refresh();
      }
    },
    [addToast, router]
  );

  const columns: DataTableColumn<ProductRow>[] = [
    {
      header: "Nome",
      accessor: "name",
      sortable: true,
      render: (_val, row) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.sku ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Prezzo",
      accessor: "price",
      sortable: true,
      render: (val) => `€${(val as number).toFixed(2)}`,
    },
    {
      header: "Stock",
      accessor: "stock_quantity",
      sortable: true,
    },
    {
      header: "Stato",
      accessor: "is_active",
      render: (val) => (
        <Badge variant={val ? "success" : "error"}>
          {val ? "Attivo" : "Inattivo"}
        </Badge>
      ),
    },
  ];

  const actions: DataTableAction<ProductRow>[] = [
    {
      label: "Modifica",
      onClick: (row) => router.push(`/admin/products/${row.id}/edit`),
    },
    {
      label: "Dettaglio",
      onClick: (row) => router.push(`/admin/products/${row.id}`),
    },
    {
      label: "Attiva/Disattiva",
      onClick: (row) => void handleToggle(row.id),
    },
    {
      label: "Elimina",
      danger: true,
      onClick: (row) => setDeleteId(row.id),
    },
  ];

  return (
    <>
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex flex-1 gap-2">
          <Input
            label=""
            placeholder="Cerca prodotto..."
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            Cerca
          </button>
        </div>
        <select
          value={currentCategory ?? ""}
          onChange={(e) => updateParams("category", e.target.value || null)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          aria-label="Filtra per categoria"
        >
          <option value="">Tutte le categorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions bar */}
      <BulkActions selectedIds={selectedIds} onBulkAction={handleBulkAction} />

      <DataTable<ProductRow>
        data={products as ProductRow[]}
        columns={columns}
        rowKey="id"
        actions={actions}
        selectable
        onSelectionChange={setSelectedIds}
        page={page}
        perPage={20}
        totalCount={totalCount}
        onPageChange={(p) => updateParams("page", String(p))}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Elimina prodotto"
        description="Sei sicuro di voler eliminare questo prodotto? L'azione è irreversibile."
        confirmLabel="Elimina"
        danger
        loading={deleting}
      />
    </>
  );
}

export { ProductsTable };
