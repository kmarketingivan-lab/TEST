"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface BulkActionsProps {
  selectedIds: string[];
  onBulkAction: (action: "activate" | "deactivate" | "delete", ids: string[]) => Promise<void>;
}

function BulkActions({ selectedIds, onBulkAction }: BulkActionsProps) {
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!confirmAction) return;
    setLoading(true);
    await onBulkAction(confirmAction, selectedIds);
    setLoading(false);
    setConfirmAction(null);
  }, [confirmAction, onBulkAction, selectedIds]);

  if (selectedIds.length === 0) return null;

  const actionLabels = {
    activate: "Attiva",
    deactivate: "Disattiva",
    delete: "Elimina",
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
        <span className="text-sm font-medium text-blue-800">
          {selectedIds.length} selezionati
        </span>
        <Button size="sm" variant="secondary" onClick={() => setConfirmAction("activate")}>
          Attiva
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setConfirmAction("deactivate")}>
          Disattiva
        </Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmAction("delete")}>
          Elimina
        </Button>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => void handleConfirm()}
        title={`${confirmAction ? actionLabels[confirmAction] : ""} ${selectedIds.length} prodotti`}
        description={`Sei sicuro di voler ${confirmAction === "delete" ? "eliminare" : confirmAction === "activate" ? "attivare" : "disattivare"} ${selectedIds.length} prodotti selezionati?`}
        confirmLabel={confirmAction ? actionLabels[confirmAction] : "Conferma"}
        danger={confirmAction === "delete"}
        loading={loading}
      />
    </>
  );
}

export { BulkActions };
