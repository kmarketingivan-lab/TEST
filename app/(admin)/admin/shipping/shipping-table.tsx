"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deleteShippingZone } from "./actions";

interface ShippingRow {
  id: string;
  name: string;
  countries: string[];
  flat_rate: number;
  min_order_free_shipping: number | null;
  per_kg_rate: number | null;
  is_active: boolean;
  [key: string]: unknown;
}

interface ShippingTableProps {
  zones: ShippingRow[];
}

function ShippingTable({ zones }: ShippingTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteShippingZone(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Zona eliminata");
      router.refresh();
    }
  }, [deleteId, addToast, router]);

  const columns: DataTableColumn<ShippingRow>[] = [
    { header: "Nome", accessor: "name", sortable: true },
    {
      header: "Paesi",
      accessor: "countries",
      render: (val) => {
        const arr = val as string[];
        return arr?.length ? arr.join(", ") : "—";
      },
    },
    {
      header: "Tariffa fissa",
      accessor: "flat_rate",
      render: (val) => `€${(val as number).toFixed(2)}`,
    },
    {
      header: "Gratis sopra",
      accessor: "min_order_free_shipping",
      render: (val) => (val ? `€${(val as number).toFixed(2)}` : "—"),
    },
    {
      header: "Stato",
      accessor: "is_active",
      render: (val) => (
        <Badge variant={val ? "success" : "error"}>
          {val ? "Attiva" : "Inattiva"}
        </Badge>
      ),
    },
  ];

  const actions: DataTableAction<ShippingRow>[] = [
    { label: "Modifica", onClick: (row) => router.push(`/admin/shipping/${row.id}/edit`) },
    { label: "Elimina", danger: true, onClick: (row) => setDeleteId(row.id) },
  ];

  return (
    <>
      <DataTable<ShippingRow>
        data={zones}
        columns={columns}
        rowKey="id"
        actions={actions}
        emptyMessage="Nessuna zona di spedizione trovata"
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Elimina zona"
        description="Sei sicuro di voler eliminare questa zona di spedizione?"
        confirmLabel="Elimina"
        danger
        loading={deleting}
      />
    </>
  );
}

export { ShippingTable };
