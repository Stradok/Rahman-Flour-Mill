"use client";

import { SignatureConfirmModal } from "@/components/dashboard/SignatureConfirmModal";

interface ReturnConfirmModalProps {
  summary: string;
  onConfirm: (returnedBy: string, reason: string) => void;
  onCancel: () => void;
}

export function ReturnConfirmModal({ summary, onConfirm, onCancel }: ReturnConfirmModalProps) {
  return (
    <SignatureConfirmModal
      title="Return this sale?"
      description="Type your name and why it's being returned. Both are saved to the Return Log — the bags come back into stock, and any credit still owed on this bill goes down by this item's value."
      summary={summary}
      confirmLabel="Confirm Return"
      nameLabel="Your Name"
      reasonLabel="Reason for return"
      reasonPlaceholder="e.g. Customer said bags were damaged"
      titleClassName="text-amber"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
