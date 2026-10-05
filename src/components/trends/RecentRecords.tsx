import Link from "next/link";
import { dowLabel, monthDay } from "@/lib/date";
import { isEmptyDay } from "@/lib/day";
import type { DayRecord, GutState, MealSlot } from "@/types/day";

const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "朝",
  lunch: "昼",
  dinner: "夜",
  snack: "間食",
};

const GUT_MARK: Record<GutState, string> = { ok: "○", mid: "△", ng: "✕" };

/** 1行目：トレーニング種目＋ヨガ。 */
function trainingLine(d: DayRecord): string {
  const parts = d.sets.map(
    (s) => `${s.name}${s.value === null ? "" : ` ${s.value}${s.unit}`}`,
  );
  if (d.habits.amYoga) parts.push("朝ヨガ ✓");
  if (d.habits.pmYoga) parts.push("夜ヨガ ✓");
  return parts.length ? parts.join("・") : "トレーニングなし";
}

/** 2行目：食事・体組成・メモをまとめる。 */
function extraLine(d: DayRecord): string {
  const extra: string[] = [];
  if (d.meals.length) {
    extra.push(
      d.meals.map((m) => `${SLOT_LABEL[m.slot]}：${m.text}`).join(" / "),
    );
  }
  for (const slot of ["am", "pm"] as const) {
    const s = d.body[slot];
    const p: string[] = [];
    if (s.weight !== null) p.push(`${s.weight.toFixed(1)}kg`);
    if (s.fat !== null) p.push(`${s.fat.toFixed(1)}%`);
    if (s.smm !== null) p.push(`筋${s.smm.toFixed(1)}%`);
    if (p.length) extra.push(`${slot === "am" ? "朝" : "夜"} ${p.join(" / ")}`);
  }
  if (d.memo.trim()) extra.push(`メモ：${d.memo.trim()}`);
  return extra.join("　");
}

function gutInfo(d: DayRecord): { text: string; bad: boolean; good: boolean } | null {
  const entries = (["noon", "night"] as const)
    .filter((k) => d.gut[k])
    .map((k) => `${k === "noon" ? "昼" : "夜"}${GUT_MARK[d.gut[k] as GutState]}`);
  if (!entries.length) return null;
  const bad = d.gut.noon === "ng" || d.gut.night === "ng";
  const good = !bad && (d.gut.noon === "ok" || d.gut.night === "ok");
  return { text: `腸 ${entries.join(" ")}`, bad, good };
}

/** 最近の記録一覧（直近14件）。クリックでその日の記録を開く。 */
export default function RecentRecords({ days }: { days: DayRecord[] }) {
  const recent = days
    .filter((d) => !isEmptyDay(d))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 14);

  if (!recent.length) {
    return (
      <p className="text-sm text-slate-400">
        記録がまだありません。記録画面で今日の分を入れると、ここに並びます。
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {recent.map((d) => {
        const gut = gutInfo(d);
        const extra = extraLine(d);
        return (
          <li
            key={d.date}
            className={`flex items-baseline gap-3 border-t border-slate-200 py-2.5 first:border-t-0 ${
              gut?.bad
                ? "border-l-2 border-l-rose-400 pl-2"
                : gut?.good
                  ? "border-l-2 border-l-emerald-400 pl-2"
                  : ""
            }`}
          >
            <span className="w-16 flex-none font-mono text-xs text-slate-400">
              {monthDay(d.date)}（{dowLabel(d.date)}）
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <div className="break-words text-slate-800">{trainingLine(d)}</div>
              {extra && (
                <div className="break-words text-xs text-slate-500">{extra}</div>
              )}
              {gut && (
                <div className="text-xs">
                  <span
                    className={
                      gut.bad
                        ? "font-medium text-rose-600"
                        : gut.good
                          ? "font-medium text-emerald-600"
                          : "text-slate-500"
                    }
                  >
                    {gut.text}
                  </span>
                </div>
              )}
            </div>
            <Link
              href={`/app?date=${d.date}`}
              className="flex-none text-xs text-sky-700 hover:underline"
            >
              開く
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
