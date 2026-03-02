"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deleteCoupon } from "./actions";

interface CouponRow {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  [key: string]: unknown;
}

interface CouponsTableProps {
  coupons: CouponRow[];
}

function CouponsTable({ coupons }: CouponsTableProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCoupon(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Coupon eliminato");
      router.refresh();
    }
  }, [deleteId, addToast, router]);

  const columns: DataTableColumn<CouponRow>[] = [
    { header: "Codice", accessor: "code", sortable: true },
    {
      header: "Tipo",
      accessor: "discount_type",
      render: (val) => (val === "percentage" ? "Percentuale" : "Fisso"),
    },
    {
      header: "Valore",
      accessor: "discount_value",
      render: (val, row) =>
        row.discount_type === "percentage" ? `${val}%` : `€${(val as number).toFixed(2)}`,
    },
    {
      header: "Min ordine",
      accessor: "min_order_amount",
      render: (val) => (val ? `€${(val as number).toFixed(2)}` : "—"),
    },
    {
      header: "Usi/Max",
      accessor: "current_uses",
      render: (_val, row) =>
        `${row.current_uses ?? 0}/${row.max_uses ?? "∞"}`,
    },
    {
      header: "Scadenza",
      accessor: "expires_at",
      render: (val) => (val ? new Date(val as string).toLocaleDateString("it-IT") : "—"),
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

  const actions: DataTableAction<CouponRow>[] = [
    { label: "Modifica", onClick: (row) => router.push(`/admin/coupons/${row.id}/edit`) },
    { label: "Elimina", danger: true, onClick: (row) => setDeleteId(row.id) },
  ];

  return (
    <>
      <DataTable<CouponRow>
        data={coupons}
        columns={columns}
        rowKey="id"
        actions={actions}
        emptyMessage="Nessun coupon trovato"
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Elimina coupon"
        description="Sei sicuro di voler eliminare questo coupon?"
        confirmLabel="Elimina"
        danger
        loading={deleting}
      />
    </>
  );
}

export { CouponsTable };
