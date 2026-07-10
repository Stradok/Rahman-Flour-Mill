"use client";

import { useEffect, useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";

interface SignatureConfirmModalProps {
  title: string;
  description: string;
  summary: string;
  confirmLabel: string;
  nameLabel?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  titleClassName?: string;
  onConfirm: (name: string, reason: string) => void;
  onCancel: () => void;
}

export function SignatureConfirmModal({
  title,
  description,
  summary,
  confirmLabel,
  nameLabel = "Your Name",
  reasonLabel = "Reason",
  reasonPlaceholder = "Add a short reason",
  titleClassName = "text-pink",
  onConfirm,
  onCancel,
}: SignatureConfirmModalProps) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const canConfirm = name.trim().length > 0 && reason.trim().length > 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
      onClick={onCancel}
    >
      <div
        className="clay-card rounded-[32px] p-6 w-full max-w-md flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className={`font-heading font-black text-xl ${titleClassName}`}>{title}</h2>
          <p className="text-sm text-muted mt-1">{summary}</p>
        </div>
        <p className="text-xs text-muted">{description}</p>

        <ClayInput
          id="signature-confirm-name"
          label={nameLabel}
          placeholder="Type your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signature-confirm-reason" className="text-sm font-medium text-muted">
            {reasonLabel}
          </label>
          <textarea
            id="signature-confirm-reason"
            rows={3}
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="clay-pressed w-full rounded-[20px] bg-canvas px-4 py-3 text-ink font-body outline-none resize-none
              focus:shadow-[inset_12px_12px_22px_#d9d4e3,inset_-12px_-12px_22px_#ffffff]"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <ClayButton type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </ClayButton>
          <ClayButton
            type="button"
            variant="danger"
            disabled={!canConfirm}
            onClick={() => onConfirm(name.trim(), reason.trim())}
          >
            {confirmLabel}
          </ClayButton>
        </div>
      </div>
    </div>
  );
}
