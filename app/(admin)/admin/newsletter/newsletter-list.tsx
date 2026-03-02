"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleNewsletterSubscription } from "./actions";

interface SubscriberRow {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  subscribed_at: string;
  [key: string]: unknown;
}

interface NewsletterListProps {
  subscribers: SubscriberRow[];
}

function NewsletterList({ subscribers }: NewsletterListProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const handleToggle = useCallback(
    async (id: string) => {
      const result = await toggleNewsletterSubscription(id);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", "Stato aggiornato");
        router.refresh();
      }
    },
    [addToast, router]
  );

  const handleExportCSV = useCallback(() => {
    const header = "Email,Nome,Attivo,Data iscrizione\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.email}","${s.full_name ?? ""}","${s.is_active ? "Si" : "No"}","${new Date(s.subscribed_at).toLocaleDateString("it-IT")}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [subscribers]);

  const columns: DataTableColumn<SubscriberRow>[] = [
    { header: "Email", accessor: "email", sortable: true },
    { header: "Nome", accessor: "full_name" },
    {
      header: "Data",
      accessor: "subscribed_at",
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString("it-IT"),
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

  const actions: DataTableAction<SubscriberRow>[] = [
    {
      label: "Attiva/Disattiva",
      onClick: (row) => void handleToggle(row.id),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          Esporta CSV
        </Button>
      </div>
      <DataTable<SubscriberRow>
        data={subscribers}
        columns={columns}
        rowKey="id"
        actions={actions}
        emptyMessage="Nessun iscritto trovato"
      />
    </>
  );
}

export { NewsletterList };
