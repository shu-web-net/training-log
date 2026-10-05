"use client";

import SectionLabel from "@/components/record/SectionLabel";
import type { Habits } from "@/types/day";

const ITEMS: { key: keyof Habits; label: string }[] = [
  { key: "amYoga", label: "朝ヨガ" },
  { key: "pmYoga", label: "夜ヨガ" },
];

/** ヨガのチェック（朝・夜）。今月の回数も表示する。 */
export default function YogaSection({
  habits,
  monthCounts,
  onToggle,
}: {
  habits: Habits;
  monthCounts: Record<keyof Habits, number>;
  onToggle: (key: keyof Habits, value: boolean) => void;
}) {
  return (
    <section>
      <SectionLabel>ヨガ（やったらチェック）</SectionLabel>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ITEMS.map(({ key, label }) => {
          const on = habits[key];
          return (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition ${
                on
                  ? "border-violet-400 bg-violet-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={(e) => onToggle(key, e.target.checked)}
                className="h-5 w-5 flex-none accent-violet-600"
              />
              <span
                className={`font-medium ${on ? "text-violet-700" : "text-slate-700"}`}
              >
                {label}
              </span>
              <span className="ml-auto font-mono text-xs text-slate-400">
                今月 {monthCounts[key]}回
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
