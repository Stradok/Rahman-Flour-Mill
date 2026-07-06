import { ProfitProjectionCards } from "@/components/dashboard/ProfitProjectionCards";
import { ProductionMixChart } from "@/components/dashboard/ProductionMixChart";
import { BusinessTrends } from "@/components/dashboard/BusinessTrends";

export default function ProfitProjectionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ProfitProjectionCards />
        <ProductionMixChart />
      </div>
      <BusinessTrends />
    </div>
  );
}
