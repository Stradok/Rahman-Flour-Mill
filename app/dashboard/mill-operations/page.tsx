import { OwnerGuard } from "@/components/OwnerGuard";
import { GrindingReminderBanner } from "@/components/dashboard/GrindingReminderBanner";
import { MillOperationsStats } from "@/components/dashboard/MillOperationsStats";
import { StockCheck } from "@/components/shared/StockCheck";
import { DailyStockTable } from "@/components/dashboard/DailyStockTable";
import { SalesSearch } from "@/components/dashboard/SalesSearch";

export default function MillOperationsPage() {
  return (
    <OwnerGuard>
    <div className="flex flex-col gap-6">
      <GrindingReminderBanner />
      <MillOperationsStats />
      <StockCheck dateSelectable />
      <DailyStockTable />
      <SalesSearch />
    </div>
    </OwnerGuard>
  );
}
