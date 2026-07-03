import type { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface ClaySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  placeholder?: string;
}

export function ClaySelect({
  label,
  options,
  placeholder,
  className = "",
  id,
  ...rest
}: ClaySelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`clay-pressed w-full rounded-[20px] bg-canvas px-4 py-3 text-ink font-body outline-none appearance-none cursor-pointer ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
