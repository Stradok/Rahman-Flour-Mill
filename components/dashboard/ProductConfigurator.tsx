"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { nowDatetimeLocal } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";
import { BrandRow } from "./BrandRow";

export function ProductConfigurator() {
  const { brands, addBrand, logProductChange } = useAppStore();
  const { data: session } = useSession();
  const [newBrandName, setNewBrandName] = useState("");

  const changedBy = session?.user?.name || session?.user?.email || "Unknown";
  const canAdd = newBrandName.trim().length > 0;

  const handleAddBrand = () => {
    if (!canAdd) return;
    const trimmed = newBrandName.trim();
    addBrand(trimmed);
    logProductChange({
      changedAt: nowDatetimeLocal(),
      summary: `Added brand "${trimmed}"`,
      changedBy,
    });
    setNewBrandName("");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {brands.map((brand) => (
          <BrandRow key={brand.id} brand={brand} />
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-muted/15">
        <ClayInput
          label="New brand name"
          placeholder="e.g. Chakki Atta"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
        />
        <ClayButton type="button" className="self-end" disabled={!canAdd} onClick={handleAddBrand}>
          Add Brand
        </ClayButton>
        <p className="text-xs text-muted text-center">
          Every change here — adding, editing, or removing a brand or size — is saved to the
          Change Log below, attributed to <span className="font-extrabold text-violet">{changedBy}</span>.
        </p>
      </div>
    </div>
  );
}
