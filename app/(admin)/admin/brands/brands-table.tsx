"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deleteBrand } from "./actions";

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  product_count: number;
  is_active: boolean;
  [key: string]: unknown;
}

interface BrandsTableProps {
  brands: BrandRow[];
}

function BrandsTable({ brands }: BrandsTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteBrand(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Marchio eliminato");
      router.refresh();
    }
  }, [deleteId, addToast, router]);

  const columns: DataTableColumn<BrandRow>[] = [
    { header: "Nome", accessor: "name", sortable: true },
    { header: "Slug", accessor: "slug" },
    {
      header: "Logo",
      accessor: "logo_url",
      render: (val) =>
        val ? (
          <img src={val as string} alt="" className="h-8 w-8 rounded object-contain" />
        ) : (
          "—"
        ),
    },
    { header: "Prodotti", accessor: "product_count", sortable: true },
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

  const actions: DataTableAction<BrandRow>[] = [
    { label: "Modifica", onClick: (row) => router.push(`/admin/brands/${row.id}/edit`) },
    { label: "Elimina", danger: true, onClick: (row) => setDeleteId(row.id) },
  ];

  return (
    <>
      <DataTable<BrandRow>
        data={brands}
        columns={columns}
        rowKey="id"
        actions={actions}
        emptyMessage="Nessun marchio trovato"
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Elimina marchio"
        description="Sei sicuro di voler eliminare questo marchio?"
        confirmLabel="Elimina"
        danger
        loading={deleting}
      />
    </>
  );
}

export { BrandsTable };
