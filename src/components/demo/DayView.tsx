import { dowLabel, monthDay, relativeLabel } from "@/lib/date";
import type { DayRecord, GutState, MealSlot } from "@/types/day";

const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "朝",
  lunch: "昼",
  dinner: "夜",
  snack: "間食",
};
const GUT_MARK: Record<GutState, string> = { ok: "○", mid: "△", ng: "✕" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-t border-slate-100 py-2 first:border-t-0">
      <span className="w-20 flex-none text-xs tracking-wider text-slate-400">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-sm text-slate-800">{children}</div>
    </div>
  );
}

/** デモ用：その日の記録を読み取り専用で表示する。 */
export default function DayView({ day }: { day: DayRecord | null }) {
  if (!day) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        この日の記録はありません。
      </p>
    );
  }

  const bodyLine = (["am", "pm"] as const)
    .map((slot) => {
      const s = day.body[slot];
      const p: string[] = [];
      if (s.weight !== null) p.push(`${s.weight.toFixed(1)}kg`);
      if (s.fat !== null) p.push(`体脂肪${s.fat.toFixed(1)}%`);
      if (s.smm !== null) p.push(`筋${s.smm.toFixed(1)}%`);
      return p.length ? `${slot === "am" ? "朝" : "夜"} ${p.join(" / ")}` : null;
    })
    .filter(Boolean)
    .join("　");

  const yoga = [
    day.habits.amYoga ? "朝ヨガ" : null,
    day.habits.pmYoga ? "夜ヨガ" : null,
  ].filter(Boolean);

  const gut = (["noon", "night"] as const)
    .filter((k) => day.gut[k])
    .map((k) => `${k === "noon" ? "昼" : "夜"} ${GUT_MARK[day.gut[k] as GutState]}`);

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-mono text-lg font-semibold text-slate-900">
          {monthDay(day.date)}
        </span>
        <span className="text-sm text-slate-500">
          （{dowLabel(day.date)}）{relativeLabel(day.date)}
        </span>
      </div>

      <Row label="トレーニング">
        {day.sets.length ? (
          <ul className="flex flex-col gap-0.5">
            {day.sets.map((s) => (
              <li key={s.id}>
                {s.name}
                {s.value === null ? "" : ` ${s.value}${s.unit}`}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-slate-400">なし</span>
        )}
      </Row>

      <Row label="ヨガ">
        {yoga.length ? yoga.join("・") : <span className="text-slate-400">なし</span>}
      </Row>

      <Row label="体組成">
        {bodyLine || <span className="text-slate-400">なし</span>}
      </Row>

      <Row label="食べたもの">
        {day.meals.length ? (
          <ul className="flex flex-col gap-0.5">
            {day.meals.map((m) => (
              <li key={m.id}>
                <span className="text-amber-700">{SLOT_LABEL[m.slot]}</span>：
                {m.text}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-slate-400">なし</span>
        )}
      </Row>

      <Row label="腸の調子">
        {gut.length ? gut.join("　") : <span className="text-slate-400">なし</span>}
      </Row>

      <Row label="メモ">
        {day.memo.trim() || <span className="text-slate-400">なし</span>}
      </Row>
    </div>
  );
}
