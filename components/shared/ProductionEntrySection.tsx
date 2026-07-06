"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import { CollapsibleSection } from "@/components/clay/CollapsibleSection";
import { ProductionMixTable } from "./ProductionMixTable";
import { productionMixByBrand, totalBagsProduced } from "@/lib/calculations";
import { nowDatetimeLocal } from "@/lib/datetime";
import { useAppStore } from "@/store/AppStore";

function rowKey(brandId: string, sizeId: string) {
  return `${brandId}:${sizeId}`;
}

export function ProductionEntrySection() {
  const { brands, productionLog, addProductionEntry, lastEnteredBy, setLastEnteredBy } =
    useAppStore();

  const rows = brands.flatMap((brand) =>
    brand.packagingSizes.map((size) => ({ brand, size }))
  );

  const [date, setDate] = useState(nowDatetimeLocal);
  const [bagsByRow, setBagsByRow] = useState<Record<string, string>>({});
  const [enteredBy, setEnteredBy] = useState("");

  const mix = productionMixByBrand(productionLog);
  const total = totalBagsProduced(productionLog);
  const nameValue = enteredBy || lastEnteredBy;

  const handleSaveAll = () => {
    let savedAny = false;
    for (const { brand, size } of rows) {
      const key = rowKey(brand.id, size.id);
      const bagCount = Number(bagsByRow[key]);
      if (bagCount > 0) {
        addProductionEntry({
          date,
          brandId: brand.id,
          brandName: brand.name,
          packagingSizeId: size.id,
          packagingLabel: size.label,
          weightKg: size.weightKg,
          bags: bagCount,
          enteredBy: nameValue || undefined,
        });
        savedAny = true;
      }
    }
    if (!savedAny) return;
    setBagsByRow({});
    setDate(nowDatetimeLocal());
    if (nameValue) setLastEnteredBy(nameValue);
  };

  return (
    <CollapsibleSection
      icon="3️⃣"
      title="Production"
      description="Enter bags made per brand/size, then save once."
      badge={
        <div className="clay-pressed rounded-[16px] px-4 py-2 shrink-0">
          <span className="text-xs text-muted font-medium mr-1">Total</span>
          <span className="font-heading font-black text-pink">{total.toLocaleString()} bags</span>
        </div>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">
          No brands/sizes configured yet — add them from Product &amp; Packaging first.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ClayInput
              id="production-datetime"
              label="Date & Time"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <ClayInput
              id="production-entered-by"
              label="Entered By"
              value={nameValue}
              onChange={(e) => setEnteredBy(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rows.map(({ brand, size }) => {
              const key = rowKey(brand.id, size.id);
              return (
                <ClayInput
                  key={key}
                  label={`${brand.name} · ${size.label}`}
                  type="number"
                  suffix="bags"
                  value={bagsByRow[key] ?? ""}
                  onChange={(e) =>
                    setBagsByRow((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              );
            })}
          </div>

          <ClayButton type="button" onClick={handleSaveAll} className="self-end">
            Save Production
          </ClayButton>
        </>
      )}

      <div className="clay-pressed rounded-[20px] p-4 flex flex-col gap-3">
        <span className="text-sm font-medium text-muted">Production Mix</span>
        <ProductionMixTable mix={mix} totalBags={total} />
      </div>

      <p className="text-xs text-muted text-center">
        To view, edit, or remove entries you&apos;ve already logged, see the{" "}
        <span className="font-extrabold text-violet">Entries</span> page in the sidebar.
      </p>
    </CollapsibleSection>
  );
}
