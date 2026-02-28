"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deletePage, togglePublished } from "./actions";
import type { Page } from "@/types/database";

interface PagesTableProps {
  pages: Page[];
}

type PageRow = Page & Record<string, unknown>;

function PagesTable({ pages }: PagesTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deletePage(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if ("error" in result) addToast("error", result.error);
    else { addToast("success", "Pagina eliminata"); router.refresh(); }
  }, [deleteId, addToast, router]);

  const handleToggle = useCallback(async (id: string) => {
    const result = await togglePublished(id);
    if ("error" in result) addToast("error", result.error);
    else { addToast("success", "Stato aggiornato"); router.refresh(); }
  }, [addToast, router]);

  const columns: DataTableColumn<PageRow>[] = [
    { header: "Titolo", accessor: "title", sortable: true },
    { header: "Slug", accessor: "slug" },
    {
      header: "Stato",
      accessor: "is_published",
      render: (val) => <Badge variant={val ? "success" : "warning"}>{val ? "Pubblicata" : "Bozza"}</Badge>,
    },
  ];

  const actions: DataTableAction<PageRow>[] = [
    { label: "Modifica", onClick: (row) => router.push(`/admin/pages/${row.id}/edit`) },
    { label: "Pubblica/Nascondi", onClick: (row) => void handleToggle(row.id) },
    { label: "Elimina", danger: true, onClick: (row) => setDeleteId(row.id) },
  ];

  return (
    <>
      <DataTable<PageRow> data={pages as PageRow[]} columns={columns} rowKey="id" actions={actions} />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Elimina pagina"
        description="Sei sicuro di voler eliminare questa pagina?"
        confirmLabel="Elimina"
        danger
        loading={deleting}
      />
    </>
  );
}

export { PagesTable };
