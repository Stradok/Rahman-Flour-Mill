import { QuickBillForm } from "@/components/sales/QuickBillForm";
import { TransactionsLedger } from "@/components/sales/TransactionsLedger";
import { CostOverheadLedger } from "@/components/shared/CostOverheadLedger";

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QuickBillForm />
        <TransactionsLedger />
      </div>
      <CostOverheadLedger />
    </div>
  );
}
