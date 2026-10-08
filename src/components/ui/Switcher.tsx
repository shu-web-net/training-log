"use client";

/** 丸いトグル群（項目・期間などの単一選択で共用）。 */
export default function Switcher<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-3 py-1 text-xs ${
              on
                ? "border-slate-900 bg-primary text-on-primary"
                : "border-slate-300 text-slate-500 hover:border-slate-500"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
