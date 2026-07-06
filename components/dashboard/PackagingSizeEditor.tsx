"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import type { PackagingSize } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";

export function PackagingSizeEditor({ brandId, size }: { brandId: string; size: PackagingSize }) {
  const { updatePackagingSize, removePackagingSize } = useAppStore();
  const [weightKg, setWeightKg] = useState(String(size.weightKg));
  const [basePrice, setBasePrice] = useState(String(size.basePrice));

  const commit = () => {
    const weight = Number(weightKg) || 0;
    updatePackagingSize(brandId, size.id, {
      label: `${weight}kg`,
      weightKg: weight,
      basePrice: Number(basePrice) || 0,
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
          onBlur={commit}
        />
        <ClayInput
          id={`size-${size.id}-price`}
          label="Base price"
          type="number"
          suffix="Rs"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          onBlur={commit}
        />
      </div>
      <ClayButton
        type="button"
        variant="danger"
        size="sm"
        className="self-end"
        onClick={() => removePackagingSize(brandId, size.id)}
      >
        Remove
      </ClayButton>
    </div>
  );
}
