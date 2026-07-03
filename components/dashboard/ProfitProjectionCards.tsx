"use client";

import { ClayCard } from "@/components/clay/ClayCard";
import { TARGET_MARGIN_PER_BAG } from "@/lib/constants";
import {
  cashOnHand,
  costPerBag,
  marginHealth,
  profitPerBag,
  runwayIndicator,
  totalBagsSold,
  totalOverheadCost,
  totalRawMaterialCost,
  totalRevenue,
} from "@/lib/calculations";
import { useAppStore } from "@/store/AppStore";
import { RunwayChart } from "./RunwayChart";

const HEALTH_LABEL = {
  above: { text: "On Target", color: "text-emerald" },
  near: { text: "Near Target", color: "text-amber" },
  below: { text: "Below Target", color: "text-pink" },
};

export function ProfitProjectionCards() {
  const { transactions, costLedger } = useAppStore();

  const bags = totalBagsSold(transactions);
  const revenue = totalRevenue(transactions);
  const totalCost = totalRawMaterialCost(costLedger) + totalOverheadCost(costLedger);

  const perBagCost = costPerBag(totalCost, bags);
  const avgRetailPerBag = bags > 0 ? revenue / bags : 0;
  const perBagProfit = profitPerBag(avgRetailPerBag, perBagCost);
  const health = marginHealth(perBagProfit, TARGET_MARGIN_PER_BAG);

  const cash = cashOnHand(transactions);
  const dailyBurn = totalOverheadCost(costLedger) / 30;
  const runwayDays = runwayIndicator(cash, dailyBurn);

  return (
    <ClayCard accent="emerald" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading font-black text-xl text-ink">Profit Projection</h2>
        <p className="text-sm text-muted">
          Cost per bag is total cost ÷ bags sold; retail price is the average sale price per bag.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="clay-pressed rounded-[18px] px-4 py-3">
          <div className="text-xs text-muted font-medium">Cost / Bag</div>
          <div className="font-heading font-black text-xl text-ink">
            Rs {perBagCost.toFixed(0)}
          </div>
        </div>
        <div className="clay-pressed rounded-[18px] px-4 py-3">
          <div className="text-xs text-muted font-medium">Profit / Bag</div>
          <div className={`font-heading font-black text-xl ${HEALTH_LABEL[health].color}`}>
            Rs {perBagProfit.toFixed(0)}
          </div>
        </div>
        <div className="clay-pressed rounded-[18px] px-4 py-3">
          <div className="text-xs text-muted font-medium">
            vs Target (Rs {TARGET_MARGIN_PER_BAG})
          </div>
          <div className={`font-heading font-black text-xl ${HEALTH_LABEL[health].color}`}>
            {HEALTH_LABEL[health].text}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-muted/15">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted">Operational Runway</span>
          <span className="text-sm font-heading font-extrabold text-ink">
            Rs {cash.toLocaleString()} cash on hand
          </span>
        </div>
        <RunwayChart days={runwayDays} />
      </div>
    </ClayCard>
  );
}
