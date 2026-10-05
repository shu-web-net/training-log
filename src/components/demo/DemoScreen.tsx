"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { parseYmd, todayStr } from "@/lib/date";
import { generateDemoDays } from "@/lib/demo";
import { measureSeries } from "@/lib/stats";
import StatsTiles from "@/components/record/StatsTiles";
import Calendar from "@/components/record/Calendar";
import WeightChart, { type ChartPoint } from "@/components/trends/WeightChart";
import RecentRecords from "@/components/trends/RecentRecords";
import DayView from "@/components/demo/DayView";
import Switcher from "@/components/ui/Switcher";
import type { BodyMeasure } from "@/types/day";

type Metric = keyof BodyMeasure;
type Range = 30 | 90 | 365;
const DAY = 86400000;

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: "weight", label: "体重", unit: "kg" },
  { value: "fat", label: "体脂肪率", unit: "%" },
  { value: "smm", label: "骨格筋率", unit: "%" },
];
const RANGES: { value: Range; label: string }[] = [
  { value: 30, label: "30日" },
  { value: 90, label: "90日" },
  { value: 365, label: "1年" },
];

function toPoints(series: { date: string; v: number }[]): ChartPoint[] {
  return series.map((r) => ({ t: parseYmd(r.date).getTime(), v: r.v, date: r.date }));
}

/** ログイン不要・読み取り専用のデモ画面。すべて架空データ。 */
export default function DemoScreen() {
  const days = useMemo(() => generateDemoDays(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [metric, setMetric] = useState<Metric>("weight");
  const [range, setRange] = useState<Range>(90);

  const loadRange = useCallback(
    (from: string, to: string) =>
      Promise.resolve(days.filter((d) => d.date >= from && d.date <= to)),
    [days],
  );

  const current = METRICS.find((m) => m.value === metric)!;
  const { am, pm } = useMemo(() => {
    const amPts = toPoints(measureSeries(days, "am", metric));
    const pmPts = toPoints(measureSeries(days, "pm", metric));
    const all = [...amPts, ...pmPts];
    if (!all.length) return { am: amPts, pm: pmPts };
    const from = Math.max(...all.map((p) => p.t)) - range * DAY;
    return {
      am: amPts.filter((p) => p.t > from),
      pm: pmPts.filter((p) => p.t > from),
    };
  }, [days, metric, range]);

  const selectedDay = days.find((d) => d.date === selectedDate) ?? null;

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">トレーニング記録</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              デモ（架空データ・保存されません）
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              トップ
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              登録して使う
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <h1 className="text-xl font-bold text-slate-900">記録（デモ）</h1>

        <StatsTiles days={days} />

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-1 font-bold text-slate-900">その日の記録</h2>
          <p className="mb-3 text-xs text-slate-400">
            カレンダーや「最近の記録」から日付を選ぶと、ここに表示されます。
          </p>
          <DayView day={selectedDay} />
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900">体組成の推移</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <i className="inline-block h-[3px] w-3.5 rounded-sm bg-amber-700" />朝
              </span>
              <span className="flex items-center gap-1">
                <i className="inline-block h-[3px] w-3.5 rounded-sm bg-indigo-700" />夜
              </span>
            </div>
          </div>
          <Switcher options={METRICS} value={metric} onChange={setMetric} ariaLabel="項目" />
          <Switcher options={RANGES} value={range} onChange={setRange} ariaLabel="期間" />
          <WeightChart am={am} pm={pm} unit={current.unit} />
        </section>

        <Calendar
          loadRange={loadRange}
          selectedDate={selectedDate}
          liveDay={null}
          onSelect={setSelectedDate}
        />

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 font-bold text-slate-900">最近の記録</h2>
          <RecentRecords days={days} onOpen={setSelectedDate} />
        </section>

        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-sm text-slate-600">
            これはデモです。自分の記録をつけるには登録してください（無料）。
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-lg bg-slate-900 px-5 py-2 font-medium text-white hover:bg-slate-700"
          >
            登録して使う
          </Link>
        </div>
      </main>
    </div>
  );
}
