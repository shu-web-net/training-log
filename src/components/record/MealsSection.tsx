"use client";

import { useState } from "react";
import { uid } from "@/lib/day";
import SectionLabel from "@/components/record/SectionLabel";
import type { Meal, MealSlot } from "@/types/day";

/** スロットの表示ラベル。保存値は英語の enum、画面は日本語。 */
const SLOTS: { value: MealSlot; label: string }[] = [
  { value: "breakfast", label: "朝" },
  { value: "lunch", label: "昼" },
  { value: "dinner", label: "夜" },
  { value: "snack", label: "間食" },
];

/** 食べたもの（朝・昼・夜・間食 × 自由入力）。行の追加・編集・削除。 */
export default function MealsSection({
  meals,
  onAdd,
  onUpdate,
  onRemove,
}: {
  meals: Meal[];
  onAdd: (meal: Meal) => void;
  onUpdate: (id: string, patch: Partial<Meal>) => void;
  onRemove: (id: string) => void;
}) {
  const [slot, setSlot] = useState<MealSlot>("breakfast");
  const [text, setText] = useState("");

  function handleAdd() {
    const tx = text.trim();
    if (!tx) return;
    onAdd({ id: uid(), slot, text: tx });
    setText("");
  }

  return (
    <section>
      <SectionLabel>食べたもの</SectionLabel>

      {meals.length === 0 ? (
        <p className="text-sm text-slate-400">
          食べたものは一言でOK。あとから見返すと役に立ちます。
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {meals.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1"
            >
              <select
                aria-label="時間帯"
                value={m.slot}
                onChange={(e) =>
                  onUpdate(m.id, { slot: e.target.value as MealSlot })
                }
                className="w-16 flex-none rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-amber-700 hover:border-slate-200 focus:border-slate-400 focus:bg-surface focus:outline-none"
              >
                {SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                aria-label="食べたもの"
                value={m.text}
                autoComplete="off"
                onChange={(e) => onUpdate(m.id, { text: e.target.value })}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-slate-200 focus:border-slate-400 focus:bg-surface focus:outline-none"
              />
              <button
                type="button"
                aria-label="削除"
                onClick={() => onRemove(m.id)}
                className="flex-none rounded-md px-2 py-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <select
          aria-label="時間帯"
          value={slot}
          onChange={(e) => setSlot(e.target.value as MealSlot)}
          className="w-24 rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 focus:border-slate-900 focus:outline-none"
        >
          {SLOTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          placeholder="例：鶏むね・ごはん・味噌汁"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus:border-slate-900 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-on-primary hover:opacity-90"
        >
          追加
        </button>
      </div>
    </section>
  );
}
