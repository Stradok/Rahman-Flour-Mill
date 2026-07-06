import { GrindingReminderBanner } from "@/components/dashboard/GrindingReminderBanner";
import { SalesPerformanceCards } from "@/components/dashboard/SalesPerformanceCards";
import { FinancialHealthCards } from "@/components/dashboard/FinancialHealthCards";
import { OperationalSnapshotCards } from "@/components/dashboard/OperationalSnapshotCards";
import { ProductionMixChart } from "@/components/dashboard/ProductionMixChart";

export default function ProfitProjectionPage() {
  return (
    <div className="flex flex-col gap-6">
      <GrindingReminderBanner />
      <SalesPerformanceCards />
      <FinancialHealthCards />
      <OperationalSnapshotCards />
      <ProductionMixChart />
    </div>
  );
}
