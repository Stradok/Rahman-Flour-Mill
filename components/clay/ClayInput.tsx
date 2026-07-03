import type { InputHTMLAttributes } from "react";

interface ClayInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  error?: string;
}

export function ClayInput({ label, suffix, error, className = "", id, ...rest }: ClayInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`clay-pressed w-full rounded-[20px] bg-canvas px-4 py-3 text-ink font-body outline-none
            focus:shadow-[inset_12px_12px_22px_#d9d4e3,inset_-12px_-12px_22px_#ffffff]
            ${suffix ? "pr-14" : ""} ${className}`}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-sm text-pink font-medium">{error}</span>}
    </div>
  );
}
