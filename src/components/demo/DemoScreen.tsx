"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { addDays, todayStr } from "@/lib/date";
import { blankDay } from "@/lib/day";
import { generateDemoDays } from "@/lib/demo";
import { exerciseNames } from "@/lib/stats";
import DateBar from "@/components/record/DateBar";
import StatsTiles from "@/components/record/StatsTiles";
import Calendar from "@/components/record/Calendar";
import RecordForm from "@/components/record/RecordForm";
import TrendsSection from "@/components/trends/TrendsSection";
import RecentRecords from "@/components/trends/RecentRecords";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { DayRecord, Habits } from "@/types/day";

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
  const exerciseSuggestions = useMemo(() => exerciseNames(days), [days]);

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
        <h1 className="text-xl font-bold text-slate-900">記録（デモ）</h1>

        <div className="flex items-start gap-2 rounded-lg border border-amber-700/40 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-700">
          <span aria-hidden className="text-base leading-none">⚠️</span>
          <p>
            これはデモです。入力・編集を自由に試せますが、
            <strong className="font-bold">内容は保存されません</strong>
            （ページを再読み込みすると、はじめの状態に戻ります）。
          </p>
        </div>

        <StatsTiles days={days} />

        <DateBar
          date={selectedDate}
          onPrev={() => setSelectedDate((d) => addDays(d, -1))}
          onNext={() => setSelectedDate((d) => addDays(d, 1))}
          onToday={() => setSelectedDate(todayStr())}
        />

        <RecordForm
          day={selectedDay}
          monthCounts={monthCounts}
          exerciseSuggestions={exerciseSuggestions}
          update={update}
        />

        <TrendsSection days={days} />

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
