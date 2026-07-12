import { OwnerGuard } from "@/components/OwnerGuard";
import { ClayCard } from "@/components/clay/ClayCard";
import { CostOverheadLedger } from "@/components/shared/CostOverheadLedger";

export default function CostLedgerPage() {
  return (
    <OwnerGuard>
    <ClayCard accent="amber" className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading font-black text-xl text-ink">
          Production Cost & Overhead Ledger
        </h1>
        <p className="text-sm text-muted">
          Log expenses and raw wheat purchases, then record production.
        </p>
      </div>
      <CostOverheadLedger />
    </ClayCard>
    </OwnerGuard>
  );
}
