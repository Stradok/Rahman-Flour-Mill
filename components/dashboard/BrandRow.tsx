"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import type { Brand } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { PackagingSizeEditor } from "./PackagingSizeEditor";

export function BrandRow({ brand }: { brand: Brand }) {
  const { addPackagingSize, removeBrand } = useAppStore();
  const [label, setLabel] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [basePrice, setBasePrice] = useState("");

  const handleAddSize = () => {
    if (!label || !weightKg || !basePrice) return;
    addPackagingSize(brand.id, {
      label,
      weightKg: Number(weightKg),
      basePrice: Number(basePrice),
    });
    setLabel("");
    setWeightKg("");
    setBasePrice("");
  };

  return (
    <div className="clay-card rounded-[28px] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-extrabold text-lg text-ink">{brand.name}</h3>
        <ClayButton type="button" variant="ghost" size="sm" onClick={() => removeBrand(brand.id)}>
          Delete brand
        </ClayButton>
      </div>

      <div className="flex flex-col gap-2">
        {brand.packagingSizes.map((size) => (
          <PackagingSizeEditor key={size.id} brandId={brand.id} size={size} />
        ))}
        {brand.packagingSizes.length === 0 && (
          <p className="text-sm text-muted">No packaging sizes yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-muted/15">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ClayInput
            label="New size"
            placeholder="e.g. 10kg"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <ClayInput
            label="Weight"
            type="number"
            suffix="kg"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
          <ClayInput
            label="Base price"
            type="number"
            suffix="Rs"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
        </div>
        <ClayButton type="button" variant="secondary" size="sm" className="self-end" onClick={handleAddSize}>
          Add Size
        </ClayButton>
      </div>
    </div>
  );
}
