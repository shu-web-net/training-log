"use client";

import SectionLabel from "@/components/record/SectionLabel";
import type { Gut, GutState } from "@/types/day";

const SLOTS: { key: keyof Gut; label: string }[] = [
  { key: "noon", label: "昼" },
  { key: "night", label: "夜" },
];

const MARKS: {
  value: GutState;
  text: string;
  aria: string;
  on: string;
  size: string; // グリフごとに描画サイズが違うので個別に合わせる
}[] = [
  {
    value: "ok",
    text: "◯",
    aria: "良い",
    size: "text-[21px]",
    on: "border-emerald-500 bg-emerald-50 text-emerald-600",
  },
  {
    value: "mid",
    text: "△",
    aria: "ふつう",
    size: "text-[18px]",
    on: "border-amber-500 bg-amber-50 text-amber-600",
  },
  {
    value: "ng",
    text: "✕",
    aria: "良くない",
    size: "text-[18px]",
    on: "border-rose-500 bg-rose-50 text-rose-600",
  },
];

/** 腸の調子（昼・夜を ○△×）。同じボタンをもう一度押すと取り消し。 */
export default function GutSection({
  gut,
  onSet,
}: {
  gut: Gut;
  onSet: (key: keyof Gut, value: GutState | undefined) => void;
}) {
  return (
    <section>
      <SectionLabel>腸の調子</SectionLabel>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SLOTS.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <span className="flex-1 font-medium text-slate-700">{label}</span>
            {MARKS.map((m) => {
              const pressed = gut[key] === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={pressed}
                  aria-label={`${label}の腸の調子：${m.aria}`}
                  onClick={() => onSet(key, pressed ? undefined : m.value)}
                  className={`flex h-8 w-9 flex-none items-center justify-center rounded-md border leading-none ${m.size} ${
                    pressed
                      ? `${m.on} font-semibold`
                      : "border-slate-200 bg-surface text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {m.text}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
