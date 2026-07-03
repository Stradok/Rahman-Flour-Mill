import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-violet text-white",
  secondary: "bg-sky text-white",
  danger: "bg-pink text-white",
  ghost: "bg-canvas text-ink",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-[16px]",
  md: "px-6 py-3 text-base rounded-[20px]",
  lg: "px-8 py-4 text-lg rounded-[24px]",
};

interface ClayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function ClayButton({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...rest
}: ClayButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`clay-btn font-heading font-extrabold transition-all duration-150 ease-out
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:-translate-y-1 active:translate-y-0 active:scale-[0.92] active:shadow-[inset_10px_10px_20px_rgba(0,0,0,0.15),inset_-10px_-10px_20px_rgba(255,255,255,0.15)]"
        }
        ${className}`}
      {...rest}
    />
  );
}
