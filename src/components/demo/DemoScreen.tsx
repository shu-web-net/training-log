"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { addDays, parseYmd, todayStr } from "@/lib/date";
import { blankDay } from "@/lib/day";
import { generateDemoDays } from "@/lib/demo";
import { measureSeries } from "@/lib/stats";
import DateBar from "@/components/record/DateBar";
import StatsTiles from "@/components/record/StatsTiles";
import Calendar from "@/components/record/Calendar";
import RecordForm from "@/components/record/RecordForm";
import WeightChart, { type ChartPoint } from "@/components/trends/WeightChart";
import RecentRecords from "@/components/trends/RecentRecords";
import Switcher from "@/components/ui/Switcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { BodyMeasure, DayRecord, Habits } from "@/types/day";

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

/**
 * ログイン不要のデモ画面。すべて架空データ。
 * 入力も試せるが、保存はされない（メモリ上だけ。再読み込みで元に戻る）。
 */
export default function DemoScreen() {
  // 架空データを日付→記録の Map で保持。編集はこの Map を更新する（永続化しない）。
  const [daysMap, setDaysMap] = useState<Map<string, DayRecord>>(() => {
    const m = new Map<string, DayRecord>();
    for (const d of generateDemoDays()) m.set(d.date, d);
    return m;
  });
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [metric, setMetric] = useState<Metric>("weight");
  const [range, setRange] = useState<Range>(90);

  const selectedDay = daysMap.get(selectedDate) ?? blankDay(selectedDate);

  // 入力の反映（メモリ上のみ）。
  const update = useCallback(
    (updater: (prev: DayRecord) => DayRecord) => {
      setDaysMap((prev) => {
        const cur = prev.get(selectedDate) ?? blankDay(selectedDate);
        const next = new Map(prev);
        next.set(selectedDate, updater(cur));
        return next;
      });
    },
    [selectedDate],
  );

  const days = useMemo(() => [...daysMap.values()], [daysMap]);

  // カレンダーは編集に追従させる（days が変わるたびに読み直す）。
  const loadRange = useCallback(
    (from: string, to: string) =>
      Promise.resolve(days.filter((d) => d.date >= from && d.date <= to)),
    [days],
  );

  const monthKey = selectedDate.slice(0, 7);
  const monthCounts = useMemo<Record<keyof Habits, number>>(() => {
    let amYoga = 0;
    let pmYoga = 0;
    for (const d of days) {
      if (d.date.slice(0, 7) !== monthKey) continue;
      if (d.habits.amYoga) amYoga++;
      if (d.habits.pmYoga) pmYoga++;
    }
    return { amYoga, pmYoga };
  }, [days, monthKey]);

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

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="hidden font-bold text-slate-900 sm:inline">
              トレーニング記録
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              デモ・保存されません
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              トップ
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-on-primary hover:opacity-90"
            >
              登録して使う
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">記録（デモ）</h1>
          <p className="mt-1 text-xs text-slate-400">
            入力や編集も試せます。ここでの変更は保存されません（再読み込みで元に戻ります）。
          </p>
        </div>

        <StatsTiles days={days} />

        <DateBar
          date={selectedDate}
          onPrev={() => setSelectedDate((d) => addDays(d, -1))}
          onNext={() => setSelectedDate((d) => addDays(d, 1))}
          onToday={() => setSelectedDate(todayStr())}
        />

        <RecordForm day={selectedDay} monthCounts={monthCounts} update={update} />

        <section className="space-y-3 rounded-lg border border-slate-200 bg-surface p-4">
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
          liveDay={selectedDay}
          onSelect={setSelectedDate}
        />

        <section className="rounded-lg border border-slate-200 bg-surface p-4">
          <h2 className="mb-2 font-bold text-slate-900">最近の記録</h2>
          <RecentRecords days={days} onOpen={setSelectedDate} />
        </section>

        <div className="rounded-lg border border-slate-200 bg-surface p-4 text-center">
          <p className="text-sm text-slate-600">
            これはデモです。自分の記録をつけるには登録してください（無料）。
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-lg bg-primary px-5 py-2 font-medium text-on-primary hover:opacity-90"
          >
            登録して使う
          </Link>
        </div>
      </main>
    </div>
  );
}
