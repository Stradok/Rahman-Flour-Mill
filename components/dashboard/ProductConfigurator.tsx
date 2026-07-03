"use client";

import { useState } from "react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { useAppStore } from "@/store/AppStore";
import { BrandRow } from "./BrandRow";

export function ProductConfigurator() {
  const { brands, addBrand } = useAppStore();
  const [newBrandName, setNewBrandName] = useState("");

  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    addBrand(newBrandName.trim());
    setNewBrandName("");
  };

  return (
    <ClayCard accent="violet" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Product & Packaging</h2>
        <p className="text-sm text-muted">
          Configure flour brands, bag sizes, and retail pricing. Feeds the Sales page dropdowns.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {brands.map((brand) => (
          <BrandRow key={brand.id} brand={brand} />
        ))}
      </div>

      <div className="flex gap-2 items-end pt-2 border-t border-muted/15">
        <div className="flex-1">
          <ClayInput
            label="New brand name"
            placeholder="e.g. Chakki Atta"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
          />
        </div>
        <ClayButton type="button" onClick={handleAddBrand}>
          Add Brand
        </ClayButton>
      </div>
    </ClayCard>
  );
}
