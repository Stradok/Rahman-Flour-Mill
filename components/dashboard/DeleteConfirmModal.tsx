"use client";

import { SignatureConfirmModal } from "./SignatureConfirmModal";

interface DeleteConfirmModalProps {
  summary: string;
  onConfirm: (deletedBy: string, reason: string) => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ summary, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <SignatureConfirmModal
      title="Delete this entry?"
      description="Type your name and the reason for deleting it. Both are saved to the Deletion Log so there's a record of who removed it and why."
      summary={summary}
      confirmLabel="Delete Entry"
      reasonLabel="Reason for deleting"
      reasonPlaceholder="e.g. Entered the wrong amount by mistake"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
