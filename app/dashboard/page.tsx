import { ProductConfigurator } from "@/components/dashboard/ProductConfigurator";
import { ProfitProjectionCards } from "@/components/dashboard/ProfitProjectionCards";
import { MillOperationsStats } from "@/components/dashboard/MillOperationsStats";
import { CostOverheadLedger } from "@/components/shared/CostOverheadLedger";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ProductConfigurator />
        <ProfitProjectionCards />
      </div>
      <MillOperationsStats />
      <CostOverheadLedger />
    </div>
  );
}
