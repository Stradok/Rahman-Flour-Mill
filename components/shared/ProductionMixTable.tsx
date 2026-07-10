import type { ProductionMixRow } from "@/lib/calculations";

interface ProductionMixTableProps {
  mix: ProductionMixRow[];
  totalBags: number;
}

export function ProductionMixTable({ mix, totalBags }: ProductionMixTableProps) {
  if (mix.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-6">
        No production logged yet — add entries from the Cost &amp; Overhead Ledger.
      </p>
    );
  }

  const sizeLabels = Array.from(
    new Map(
      mix.flatMap((row) => row.sizes.map((s) => [s.packagingLabel, s.weightKg] as const))
    ).entries()
  )
    .sort((a, b) => a[1] - b[1])
    .map(([label]) => label);

  const bagsFor = (row: ProductionMixRow, label: string) =>
    row.sizes.find((s) => s.packagingLabel === label)?.bags ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted text-xs uppercase tracking-wide">
              <th className="py-2 pr-3 font-heading font-extrabold">Brand</th>
              {sizeLabels.map((label) => (
                <th key={label} className="py-2 px-3 font-heading font-extrabold text-right">
                  {label}
                </th>
              ))}
              <th className="py-2 px-3 font-heading font-extrabold text-right">Total Bags</th>
              <th className="py-2 px-3 font-heading font-extrabold text-right">Weight (kg)</th>
              <th className="py-2 pl-3 font-heading font-extrabold text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {mix.map((row) => (
              <tr key={row.brandId} className="border-t border-muted/15">
                <td className="py-2.5 pr-3 font-heading font-extrabold text-ink whitespace-nowrap">
                  {row.brandName}
                </td>
                {sizeLabels.map((label) => {
                  const bags = bagsFor(row, label);
                  return (
                    <td key={label} className="py-2.5 px-3 text-right text-ink">
                      {bags > 0 ? bags.toLocaleString() : "–"}
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 text-right font-heading font-extrabold text-ink">
                  {row.bags.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-ink">
                  {row.totalWeightKg.toLocaleString()}
                </td>
                <td className="py-2.5 pl-3 text-right text-muted">
                  {row.percentage.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-muted/15">
        <span className="text-sm font-medium text-muted">Total Bags Produced</span>
        <span className="font-heading font-black text-xl text-ink">
          {totalBags.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
