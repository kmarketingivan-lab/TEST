"use client";

import { Modal } from "./modal";
import { Button } from "./button";

/** Props for the ConfirmDialog component */
interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when user confirms the action */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Description/message body */
  description: string;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Whether to use the danger variant (red confirm button) */
  danger?: boolean;
  /** Whether the confirm action is loading */
  loading?: boolean;
}

/**
 * Reusable confirmation dialog — "Sei sicuro?" with confirm and cancel actions.
 * Supports danger variant for delete operations.
 */
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  danger,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading ?? false}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{description}</p>
    </Modal>
  );
}

export { ConfirmDialog };
export type { ConfirmDialogProps };
