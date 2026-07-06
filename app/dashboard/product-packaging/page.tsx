import { ClayCard } from "@/components/clay/ClayCard";
import { ProductConfigurator } from "@/components/dashboard/ProductConfigurator";

export default function ProductPackagingPage() {
  return (
    <ClayCard accent="violet" className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading font-black text-xl text-ink">Product & Packaging</h1>
        <p className="text-sm text-muted">
          Configure flour brands, bag sizes, and retail pricing. Feeds the Quick Bill dropdowns.
        </p>
      </div>
      <ProductConfigurator />
    </ClayCard>
  );
}
