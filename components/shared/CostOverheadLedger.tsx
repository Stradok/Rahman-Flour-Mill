import { ExpenseSection } from "./ExpenseSection";
import { RawWheatSection } from "./RawWheatSection";
import { ProductionEntrySection } from "./ProductionEntrySection";
import { DailyGrindingSection } from "./DailyGrindingSection";

export function CostOverheadLedger() {
  return (
    <div className="flex flex-col gap-4">
      <ExpenseSection />
      <RawWheatSection />
      <ProductionEntrySection />
      <DailyGrindingSection />
    </div>
  );
}
