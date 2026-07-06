"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayInput } from "@/components/clay/ClayInput";
import {
  productionMixByBrand,
  totalBagsProduced,
  totalProductionWeightKg,
} from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";

const BAR_COLORS = ["bg-violet", "bg-pink", "bg-sky", "bg-emerald", "bg-amber"];

function rowKey(brandId: string, sizeId: string) {
  return `${brandId}:${sizeId}`;
}

export function ProductionEntrySection() {
  const { brands, productionLog, addProductionEntry } = useAppStore();

  const rows = brands.flatMap((brand) =>
    brand.packagingSizes.map((size) => ({ brand, size }))
  );

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bagsByRow, setBagsByRow] = useState<Record<string, string>>({});

  const mix = productionMixByBrand(productionLog);
  const total = totalBagsProduced(productionLog);
  const totalWeight = totalProductionWeightKg(productionLog);

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
        });
        savedAny = true;
      }
    }
    if (!savedAny) return;
    setBagsByRow({});
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-heading font-extrabold text-ink">3. Production</h3>
        <p className="text-sm text-muted">
          Enter how many bags of every brand/size were made for the period, then save once. The
          mix below compares them all against each other automatically.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">
          No brands/sizes configured yet — add them from Product &amp; Packaging first.
        </p>
      ) : (
        <>
          <ClayInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

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
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">Production Mix</span>
          <span className="text-sm font-heading font-extrabold text-ink">
            {total.toLocaleString()} bags total
          </span>
        </div>
        {mix.length === 0 && (
          <p className="text-sm text-muted text-center py-2">No production logged yet.</p>
        )}
        {mix.map((row, i) => (
          <div key={row.brandId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-heading font-extrabold text-ink">{row.brandName}</span>
              <span className="text-muted">
                {row.bags.toLocaleString()} bags · {row.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="rounded-full h-3 w-full bg-canvas overflow-hidden">
              <div
                className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${Math.max(row.percentage, 2)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                {row.sizes.map((s, j) => (
                  <span key={s.packagingSizeId}>
                    {j > 0 && " · "}
                    {s.packagingLabel}: {s.bags.toLocaleString()}
                  </span>
                ))}
              </span>
              <span className="font-medium text-ink">{row.totalWeightKg.toLocaleString()} kg</span>
            </div>
          </div>
        ))}
        {mix.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-muted/15">
            <span className="text-xs font-medium text-muted">Total Production</span>
            <span className="text-sm font-heading font-extrabold text-ink">
              {total.toLocaleString()} bags · {totalWeight.toLocaleString()} kg
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted text-center">
        To view, edit, or remove entries you've already logged, see the{" "}
        <span className="font-extrabold text-violet">Entries</span> page in the sidebar.
      </p>
    </div>
  );
}
