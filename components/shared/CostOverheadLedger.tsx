import { ExpenseSection } from "./ExpenseSection";
import { RawWheatSection } from "./RawWheatSection";
import { ProductionEntrySection } from "./ProductionEntrySection";

export function CostOverheadLedger() {
  return (
    <div className="flex flex-col gap-8">
      <ExpenseSection />
      <div className="border-t border-muted/15" />
      <RawWheatSection />
      <div className="border-t border-muted/15" />
      <ProductionEntrySection />
    </div>
  );
}
