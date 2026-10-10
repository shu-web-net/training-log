"use client";

import { useState } from "react";
import { DEFAULT_EXERCISES, UNITS, uid } from "@/lib/day";
import SectionLabel from "@/components/record/SectionLabel";
import type { TrainingSet, Unit } from "@/types/day";

/** 文字列の数値入力を number|null に。空や非数は null。負数は0に丸める。 */
function toValue(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return isFinite(n) ? Math.max(0, n) : null;
}

// 種目名から単位を推測する（手で変えればそちらが優先）。
const UNIT_HINTS: [RegExp, Unit][] = [
  [/ウォーキング|散歩|歩き|歩行/, "歩"],
  [
    /サイクリング|自転車|バイク|ボクシング|ヨガ|ストレッチ|ランニング|ジョギング|エアロ|有酸素|水泳|踏み台|ダンス|縄跳び|なわとび/,
    "分",
  ],
  [/プランク/, "秒"],
];
function guessUnit(name: string): Unit {
  for (const [re, u] of UNIT_HINTS) if (re.test(name)) return u;
  return "回";
}

const DATALIST_ID = "exercise-name-list";

/**
 * トレーニング（種目・量・単位）。
 * 既存行はその場で編集・削除、下の欄から追加できる。
 */
export default function TrainingSection({
  sets,
  suggestions = [],
  onAdd,
  onUpdate,
  onRemove,
}: {
  sets: TrainingSet[];
  /** 過去に使った種目名（最近使った順）。入力補完とクイック選択に使う。 */
  suggestions?: string[];
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

  // クイック選択：過去に使った種目 ＋ まだ使っていない定番、を最大8件。
  const picks = [
    ...suggestions,
    ...DEFAULT_EXERCISES.filter((n) => !suggestions.includes(n)),
  ].slice(0, 8);

  function pick(n: string) {
    setName(n);
    setUnit(guessUnit(n));
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
                list={DATALIST_ID}
                value={s.name}
                onChange={(e) => onUpdate(s.id, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-slate-200 focus:border-slate-400 focus:bg-surface focus:outline-none"
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
                className="w-16 rounded-md border border-transparent bg-transparent px-2 py-1 text-right font-mono tabular-nums hover:border-slate-200 focus:border-slate-400 focus:bg-surface focus:outline-none"
              />
              <select
                aria-label="単位"
                value={s.unit}
                onChange={(e) =>
                  onUpdate(s.id, { unit: e.target.value as Unit })
                }
                className="w-16 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-slate-500 hover:border-slate-200 focus:border-slate-400 focus:bg-surface focus:outline-none"
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
          list={DATALIST_ID}
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
          className="rounded-lg bg-primary px-4 py-2 font-medium text-on-primary hover:opacity-90"
        >
          追加
        </button>
      </div>

      {/* 入力補完（過去に使った種目名） */}
      <datalist id={DATALIST_ID}>
        {suggestions.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {/* クイック選択：押すと種目名と単位が入る */}
      {picks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {picks.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => pick(n)}
              className="rounded-full border border-dashed border-slate-300 px-3 py-0.5 text-xs text-slate-500 hover:border-slate-500 hover:text-slate-700"
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
