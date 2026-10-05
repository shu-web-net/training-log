"use client";

import { useState } from "react";
import { UNITS, uid } from "@/lib/day";
import SectionLabel from "@/components/record/SectionLabel";
import type { TrainingSet, Unit } from "@/types/day";

/** 文字列の数値入力を number|null に。空や非数は null。負数は0に丸める。 */
function toValue(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return isFinite(n) ? Math.max(0, n) : null;
}

/**
 * トレーニング（種目・量・単位）。
 * 既存行はその場で編集・削除、下の欄から追加できる。
 */
export default function TrainingSection({
  sets,
  onAdd,
  onUpdate,
  onRemove,
}: {
  sets: TrainingSet[];
  onAdd: (set: TrainingSet) => void;
  onUpdate: (id: string, patch: Partial<TrainingSet>) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Unit>("回");

  function handleAdd() {
    const nm = name.trim();
    if (!nm) return;
    onAdd({ id: uid(), name: nm, value: toValue(value), unit });
    setName("");
    setValue("");
    setUnit("回");
  }

  return (
    <section>
      <SectionLabel>トレーニング（種目と量）</SectionLabel>

      {sets.length === 0 ? (
        <p className="text-sm text-slate-400">
          まだ種目がありません。下の欄から追加してください。
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sets.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1"
            >
              <input
                aria-label="種目"
                value={s.name}
                onChange={(e) => onUpdate(s.id, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
              <input
                aria-label="量"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="—"
                value={s.value === null ? "" : String(s.value)}
                onChange={(e) =>
                  onUpdate(s.id, { value: toValue(e.target.value) })
                }
                className="w-16 rounded-md border border-transparent bg-transparent px-2 py-1 text-right font-mono tabular-nums hover:border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
              <select
                aria-label="単位"
                value={s.unit}
                onChange={(e) =>
                  onUpdate(s.id, { unit: e.target.value as Unit })
                }
                className="w-16 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-slate-500 hover:border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="削除"
                onClick={() => onRemove(s.id)}
                className="flex-none rounded-md px-2 py-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <input
          placeholder="種目（例：スクワット）"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus:border-slate-900 focus:outline-none"
        />
        <input
          placeholder="数"
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="w-16 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-right font-mono tabular-nums focus:border-slate-900 focus:outline-none"
        />
        <select
          aria-label="単位"
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="w-16 rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 focus:border-slate-900 focus:outline-none"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          追加
        </button>
      </div>
    </section>
  );
}
