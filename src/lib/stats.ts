import { addDays, parseYmd, todayStr } from "@/lib/date";
import type { BodyMeasure, DayRecord } from "@/types/day";

// 記録の有無を判定する小さなヘルパー群（カレンダーの点表示などで使う）。

export function hasTraining(d: DayRecord): boolean {
  return d.sets.length > 0;
}

export function hasMeals(d: DayRecord): boolean {
  return d.meals.length > 0;
}

export function hasYoga(d: DayRecord): boolean {
  return d.habits.amYoga || d.habits.pmYoga;
}

function measureFilled(m: BodyMeasure): boolean {
  return m.weight !== null || m.fat !== null || m.smm !== null;
}

export function hasBody(d: DayRecord): boolean {
  return measureFilled(d.body.am) || measureFilled(d.body.pm);
}

/** 過去に使った種目名を、最近使った順・重複なしで返す（入力補完とクイック選択に使う）。 */
export function exerciseNames(days: DayRecord[]): string[] {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const d of sorted) {
    for (const s of d.sets) {
      const n = s.name.trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
  }
  return out;
}

/** トレーニングを記録した日付の集合。 */
export function trainedSet(days: DayRecord[]): Set<string> {
  const s = new Set<string>();
  for (const d of days) if (hasTraining(d)) s.add(d.date);
  return s;
}

/**
 * 連続記録日数。今日（未記録なら昨日）から過去へ、トレーニングのある日を数える。
 * 「今日まだでも途切れ扱いにしない」ための昨日起点フォールバック付き。
 */
export function streak(trained: Set<string>, today = todayStr()): number {
  let cur = today;
  if (!trained.has(cur)) cur = addDays(cur, -1);
  let n = 0;
  while (trained.has(cur)) {
    n++;
    cur = addDays(cur, -1);
  }
  return n;
}

/** 今週（月曜起点）にトレーニングした日数。 */
export function weekCount(trained: Set<string>, today = todayStr()): number {
  const now = parseYmd(today);
  const dow = (now.getDay() + 6) % 7; // 月曜=0
  const start = parseYmd(addDays(today, -dow));
  let n = 0;
  for (const k of trained) {
    const d = parseYmd(k);
    if (d >= start && d <= now) n++;
  }
  return n;
}

/** 今月にトレーニングした日数。 */
export function monthCount(trained: Set<string>, today = todayStr()): number {
  const now = parseYmd(today);
  let n = 0;
  for (const k of trained) {
    const d = parseYmd(k);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth())
      n++;
  }
  return n;
}

/** 体組成のある項目（朝 or 夜 × 体重/体脂肪/骨格筋）を時系列で取り出す。 */
export function measureSeries(
  days: DayRecord[],
  slot: "am" | "pm",
  field: keyof BodyMeasure,
): { date: string; v: number }[] {
  return days
    .filter((d) => d.body[slot][field] !== null)
    .map((d) => ({ date: d.date, v: d.body[slot][field] as number }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** 体重（朝 or 夜）を時系列で取り出す。タイルの比較の土台。 */
export function weightSeries(
  days: DayRecord[],
  slot: "am" | "pm",
): { date: string; v: number }[] {
  return measureSeries(days, slot, "weight");
}

/** 最新の体重と、その1つ前との差分。タイル表示用。 */
export function latestWeight(
  days: DayRecord[],
  slot: "am" | "pm",
): { value: number; diff: number | null } | null {
  const s = weightSeries(days, slot);
  if (s.length === 0) return null;
  const last = s[s.length - 1].v;
  const prev = s.length > 1 ? s[s.length - 2].v : null;
  return { value: last, diff: prev === null ? null : last - prev };
}
