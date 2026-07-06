import { QuickBillForm } from "@/components/sales/QuickBillForm";
import { TransactionsLedger } from "@/components/sales/TransactionsLedger";
import { StockCheck } from "@/components/shared/StockCheck";

export default function QuickBillPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QuickBillForm />
        <TransactionsLedger />
      </div>
      <StockCheck />
    </div>
  );
}
