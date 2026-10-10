import { addDays, parseYmd, todayStr } from "@/lib/date";
import type { DayRecord, GutState, TrainingSet } from "@/types/day";

// デモ用の「架空データ」。本人の実データは入れない（CLAUDE.md 6）。
// SSR とクライアントで一致させるため、乱数は使わず日付から決定論的に生成する。

const EXERCISES: { name: string; unit: TrainingSet["unit"]; base: number }[] = [
  { name: "スクワット", unit: "回", base: 30 },
  { name: "腕立て伏せ", unit: "回", base: 20 },
  { name: "プランク", unit: "秒", base: 60 },
  { name: "サイクリング", unit: "分", base: 40 },
  { name: "ウォーキング", unit: "歩", base: 8000 },
];

const GUT_CYCLE: (GutState | undefined)[] = ["ok", "ok", "mid", "ok", "ng", undefined, "ok"];

/** 小数1桁に整える。 */
function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * 直近 days 日ぶんの架空の記録を作る。
 * 体重はゆるやかに右肩下がり＋小さな波。トレーニング・ヨガ・食事・腸も日替わりで入れる。
 */
export function generateDemoDays(days = 95): DayRecord[] {
  const today = todayStr();
  const out: DayRecord[] = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i);
    const dow = parseYmd(date).getDay();

    // 1週間に1日ほど休む（記録なし）。
    if (i % 7 === 5) continue;

    // 体重：71.5kg 付近を基準に、ゆっくり下げつつ波を付ける。
    const amW = r1(72.4 - i * 0.012 + Math.sin(i / 6) * 0.35);
    const pmW = r1(amW + 0.55 + Math.sin(i / 5) * 0.15);
    const amF = r1(18.2 + Math.sin(i / 9) * 0.6);
    const amS = r1(33.1 + Math.cos(i / 10) * 0.4);

    const sets: TrainingSet[] = [];
    // 週の半分くらいトレーニング。種目は日替わりで1〜2件。
    if (i % 2 === 0 || dow === 6) {
      const e = EXERCISES[i % EXERCISES.length];
      sets.push({
        id: `demo-${date}-0`,
        name: e.name,
        value: Math.round(e.base + Math.sin(i) * (e.base * 0.1)),
        unit: e.unit,
      });
      if (i % 3 === 0) {
        const e2 = EXERCISES[(i + 2) % EXERCISES.length];
        sets.push({
          id: `demo-${date}-1`,
          name: e2.name,
          value: Math.round(e2.base + Math.cos(i) * (e2.base * 0.1)),
          unit: e2.unit,
        });
      }
    }

    const record: DayRecord = {
      date,
      sets,
      body: {
        am: { weight: amW, fat: amF, smm: amS },
        pm: { weight: pmW, fat: null, smm: null },
      },
      meals:
        i % 2 === 0
          ? [
              { id: `demo-${date}-m0`, slot: "breakfast", text: "オートミール・卵・バナナ" },
              { id: `demo-${date}-m1`, slot: "dinner", text: "鶏むね・ごはん・味噌汁" },
            ]
          : [{ id: `demo-${date}-m0`, slot: "lunch", text: "定食（魚）" }],
      habits: { amYoga: i % 3 === 0, pmYoga: i % 4 === 0 },
      gut: {
        morning: GUT_CYCLE[(i + 1) % GUT_CYCLE.length],
        noon: GUT_CYCLE[i % GUT_CYCLE.length],
        night: GUT_CYCLE[(i + 3) % GUT_CYCLE.length],
      },
      memo: i % 10 === 0 ? "体が軽い。睡眠よくとれた。" : "",
    };

    out.push(record);
  }

  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}
