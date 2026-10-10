"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, todayStr } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import { loadDays, loadMonthHabits } from "@/lib/day";
import { useDayRecord } from "@/lib/useDayRecord";
import DateBar from "@/components/record/DateBar";
import SaveStatus from "@/components/record/SaveStatus";
import StatsTiles from "@/components/record/StatsTiles";
import Calendar from "@/components/record/Calendar";
import RecordForm from "@/components/record/RecordForm";
import type { DayRecord, Habits } from "@/types/day";

/** 記録画面（メイン）。日付の移動と各入力を自動保存につなぐ。 */
export default function RecordScreen({
  userId,
  initialDate,
}: {
  userId: string;
  initialDate?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [date, setDate] = useState<string>(
    initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)
      ? initialDate
      : todayStr(),
  );
  const { day, loading, status, savedTick, update, retry } = useDayRecord(
    userId,
    date,
  );

  // 今月のヨガ記録（回数表示用）。月が変わるか、保存が成功するたびに読み直す。
  const monthKey = date.slice(0, 7);
  const [monthHabits, setMonthHabits] = useState<Record<string, Habits>>({});
  useEffect(() => {
    let cancelled = false;
    loadMonthHabits(supabase, date)
      .then((m) => {
        if (!cancelled) setMonthHabits(m);
      })
      .catch(() => {
        /* 集計は補助情報なので、失敗しても記録操作は止めない */
      });
    return () => {
      cancelled = true;
    };
    // 日付が変わるか、保存が成功するたびに読み直す（最大31行なので軽い）
  }, [supabase, date, savedTick]);

  // 集計タイル用：直近1年ぶんを読み込む（365行程度なので軽い）。保存ごとに更新。
  const [yearDays, setYearDays] = useState<DayRecord[]>([]);
  useEffect(() => {
    let cancelled = false;
    const today = todayStr();
    loadDays(supabase, addDays(today, -364), today)
      .then((rows) => {
        if (!cancelled) setYearDays(rows);
      })
      .catch(() => {
        /* タイルは補助表示なので失敗しても操作は止めない */
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, savedTick]);

  // カレンダーへ渡す取得関数（Supabase 版）。再生成でループしないよう固定する。
  const loadCalendarRange = useCallback(
    (from: string, to: string) => loadDays(supabase, from, to),
    [supabase],
  );

  // タイル集計では、編集中の日は保存前でも最新の状態を反映する。
  const tilesDays = useMemo(() => {
    if (!day) return yearDays;
    return [...yearDays.filter((d) => d.date !== date), day];
  }, [yearDays, day, date]);

  // 今月の回数。編集中の日は保存前でも最新の状態を反映する（DBの値より優先）。
  const monthCounts = useMemo<Record<keyof Habits, number>>(() => {
    const merged: Record<string, Habits> = { ...monthHabits };
    if (day) merged[date] = day.habits;
    let amYoga = 0;
    let pmYoga = 0;
    for (const [k, h] of Object.entries(merged)) {
      if (k.slice(0, 7) !== monthKey) continue;
      if (h.amYoga) amYoga++;
      if (h.pmYoga) pmYoga++;
    }
    return { amYoga, pmYoga };
  }, [monthHabits, day, date, monthKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">記録</h1>
        <SaveStatus status={status} onRetry={retry} />
      </div>

      <StatsTiles days={tilesDays} />

      <DateBar
        date={date}
        onPrev={() => setDate((d) => addDays(d, -1))}
        onNext={() => setDate((d) => addDays(d, 1))}
        onToday={() => setDate(todayStr())}
      />

      {loading || day === null ? (
        <p className="py-10 text-center text-sm text-slate-400">読み込み中…</p>
      ) : (
        <RecordForm day={day} monthCounts={monthCounts} update={update} />
      )}

      <Calendar
        loadRange={loadCalendarRange}
        refreshKey={savedTick}
        selectedDate={date}
        liveDay={day}
        onSelect={setDate}
      />
    </div>
  );
}
