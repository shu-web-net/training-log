"use client";

import SectionLabel from "@/components/record/SectionLabel";
import type { Body, BodyMeasure } from "@/types/day";

type Slot = "am" | "pm";
type Field = keyof BodyMeasure;

const FIELDS: { field: Field; label: string; unit: string }[] = [
  { field: "weight", label: "体重", unit: "kg" },
  { field: "fat", label: "体脂肪率", unit: "%" },
  { field: "smm", label: "骨格筋率", unit: "%" },
];

const SLOTS: { slot: Slot; label: string; dot: string; accent: string }[] = [
  { slot: "am", label: "朝", dot: "bg-amber-600", accent: "text-amber-700" },
  { slot: "pm", label: "夜", dot: "bg-indigo-600", accent: "text-indigo-700" },
];

function toValue(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return isFinite(n) ? Math.max(0, n) : null;
}

/** 体組成（朝・夜 × 体重・体脂肪率・骨格筋率）。 */
export default function BodySection({
  body,
  onChange,
}: {
  body: Body;
  onChange: (slot: Slot, field: Field, value: number | null) => void;
}) {
  return (
    <section>
      <SectionLabel>体組成（朝・夜）</SectionLabel>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SLOTS.map(({ slot, label, dot, accent }) => (
          <div
            key={slot}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <h3
              className={`flex items-center gap-2 text-xs font-medium tracking-wider ${accent}`}
            >
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              {label}
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              {FIELDS.map(({ field, label: fl, unit }) => (
                <div key={field} className="flex items-center gap-2">
                  <label
                    htmlFor={`${slot}-${field}`}
                    className="flex-1 text-sm text-slate-500"
                  >
                    {fl}
                  </label>
                  <input
                    id={`${slot}-${field}`}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min={0}
                    placeholder="—"
                    value={body[slot][field] === null ? "" : String(body[slot][field])}
                    onChange={(e) =>
                      onChange(slot, field, toValue(e.target.value))
                    }
                    className="w-24 rounded-md border border-slate-200 bg-surface px-2 py-1 text-right font-mono tabular-nums focus:border-slate-900 focus:outline-none"
                  />
                  <span className="w-7 text-xs text-slate-400">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
