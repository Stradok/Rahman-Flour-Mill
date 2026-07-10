"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { nowDatetimeLocal } from "@/lib/datetime";
import type { PackagingSize } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";

export function PackagingSizeEditor({
  brandId,
  brandName,
  size,
}: {
  brandId: string;
  brandName: string;
  size: PackagingSize;
}) {
  const { updatePackagingSize, removePackagingSize, logProductChange } = useAppStore();
  const { data: session } = useSession();
  const [weightKg, setWeightKg] = useState(String(size.weightKg));
  const [basePrice, setBasePrice] = useState(String(size.basePrice));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const changedBy = session?.user?.name || session?.user?.email || "Unknown";
  const isDirty = Number(weightKg) !== size.weightKg || Number(basePrice) !== size.basePrice;
  const canSave = isDirty && weightKg !== "" && basePrice !== "";

  const handleSave = () => {
    if (!canSave) return;
    const weight = Number(weightKg);
    const price = Number(basePrice);
    updatePackagingSize(brandId, size.id, {
      label: `${weight}kg`,
      weightKg: weight,
      basePrice: price,
    });
    logProductChange({
      changedAt: nowDatetimeLocal(),
      summary: `Updated ${brandName} · ${size.label} — ${size.weightKg}kg @ Rs ${size.basePrice.toLocaleString()} → ${weight}kg @ Rs ${price.toLocaleString()}`,
      changedBy,
    });
  };

  return (
    <div className="clay-pressed rounded-[18px] p-3 flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ClayInput
          id={`size-${size.id}-weight`}
          label="Weight"
          type="number"
          suffix="kg"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
        <ClayInput
          id={`size-${size.id}-price`}
          label="Base price"
          type="number"
          suffix="Rs"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
        />
      </div>
      <div className="flex gap-2 self-end">
        <ClayButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canSave}
          onClick={handleSave}
        >
          Save Changes
        </ClayButton>
        <ClayButton
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setConfirmingDelete(true)}
        >
          Remove
        </ClayButton>
      </div>

      {confirmingDelete && (
        <DeleteConfirmModal
          summary={`${brandName} · ${size.label} — Rs ${size.basePrice.toLocaleString()}`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={(changedByName, reason) => {
            removePackagingSize(brandId, size.id);
            logProductChange({
              changedAt: nowDatetimeLocal(),
              summary: `Removed ${brandName} · ${size.label} — ${reason}`,
              changedBy: changedByName,
            });
            setConfirmingDelete(false);
          }}
        />
      )}
    </div>
  );
}
