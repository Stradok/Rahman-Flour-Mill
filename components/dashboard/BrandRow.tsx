"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { nowDatetimeLocal } from "@/lib/datetime";
import type { Brand } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { PackagingSizeEditor } from "./PackagingSizeEditor";

export function BrandRow({ brand }: { brand: Brand }) {
  const { addPackagingSize, removeBrand, logProductChange } = useAppStore();
  const { data: session } = useSession();
  const [weightKg, setWeightKg] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const changedBy = session?.user?.name || session?.user?.email || "Unknown";
  const canAddSize = !!weightKg && !!basePrice;

  const handleAddSize = () => {
    if (!canAddSize) return;
    addPackagingSize(brand.id, {
      label: `${weightKg}kg`,
      weightKg: Number(weightKg),
      basePrice: Number(basePrice),
    });
    logProductChange({
      changedAt: nowDatetimeLocal(),
      summary: `Added ${brand.name} · ${weightKg}kg (Rs ${Number(basePrice).toLocaleString()})`,
      changedBy,
    });
    setWeightKg("");
    setBasePrice("");
  };

  return (
    <div className="clay-card rounded-[28px] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-extrabold text-lg text-ink">{brand.name}</h3>
        <ClayButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmingDelete(true)}
        >
          Delete brand
        </ClayButton>
      </div>

      <div className="flex flex-col gap-2">
        {brand.packagingSizes.map((size) => (
          <PackagingSizeEditor key={size.id} brandId={brand.id} brandName={brand.name} size={size} />
        ))}
        {brand.packagingSizes.length === 0 && (
          <p className="text-sm text-muted">No packaging sizes yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-muted/15">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ClayInput
            id={`brand-${brand.id}-new-weight`}
            label="Weight"
            type="number"
            suffix="kg"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
          <ClayInput
            id={`brand-${brand.id}-new-price`}
            label="Base price"
            type="number"
            suffix="Rs"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
        </div>
        <ClayButton
          type="button"
          variant="secondary"
          size="sm"
          className="self-end"
          disabled={!canAddSize}
          onClick={handleAddSize}
        >
          Add Size
        </ClayButton>
      </div>

      {confirmingDelete && (
        <DeleteConfirmModal
          summary={`Brand "${brand.name}" and all ${brand.packagingSizes.length} of its packaging sizes`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={(changedByName, reason) => {
            removeBrand(brand.id);
            logProductChange({
              changedAt: nowDatetimeLocal(),
              summary: `Deleted brand "${brand.name}" — ${reason}`,
              changedBy: changedByName,
            });
            setConfirmingDelete(false);
          }}
        />
      )}
    </div>
  );
}
