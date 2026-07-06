import { MillOperationsStats } from "@/components/dashboard/MillOperationsStats";
import { StockCheck } from "@/components/shared/StockCheck";

export default function MillOperationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <MillOperationsStats />
      <StockCheck />
    </div>
  );
}
