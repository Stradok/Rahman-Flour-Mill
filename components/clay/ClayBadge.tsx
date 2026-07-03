type Variant = "paid" | "credit";

const VARIANT_CLASSES: Record<Variant, string> = {
  paid: "bg-emerald/15 text-emerald",
  credit: "bg-amber/15 text-amber",
};

export function ClayBadge({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-[14px] px-3 py-1 text-xs font-heading font-extrabold ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
