"use client";

import { useEffect, useMemo, useState } from "react";
import { hasBody, hasMeals, hasTraining, hasYoga } from "@/lib/stats";
import { todayStr, ymd } from "@/lib/date";
import type { DayRecord } from "@/types/day";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

/** その日の腸の調子をマスの地色に落とす（×があれば警戒色、○があれば良色）。 */
function gutTone(d: DayRecord | undefined): "ok" | "ng" | "" {
  if (!d) return "";
  if (d.gut.morning === "ng" || d.gut.noon === "ng" || d.gut.night === "ng")
    return "ng";
  if (d.gut.morning === "ok" || d.gut.noon === "ok" || d.gut.night === "ok")
    return "ok";
  return "";
}

export default function Calendar({
  loadRange,
  refreshKey = 0,
  selectedDate,
  liveDay,
  onSelect,
}: {
  /** 表示月ぶんの記録を取得する（本番は Supabase、デモは架空データ）。 */
  loadRange: (from: string, to: string) => Promise<DayRecord[]>;
  /** この値が変わると読み直す（本番は保存のたび）。 */
  refreshKey?: number;
  selectedDate: string;
  liveDay: DayRecord | null;
  onSelect: (date: string) => void;
}) {
  const today = todayStr();
  const [view, setView] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const monthFrom = `${view.y}-${String(view.m + 1).padStart(2, "0")}-01`;
  const monthTo = ymd(new Date(view.y, view.m + 1, 0));

  const [days, setDays] = useState<DayRecord[]>([]);
  useEffect(() => {
    let cancelled = false;
    loadRange(monthFrom, monthTo)
      .then((rows) => {
        if (!cancelled) setDays(rows);
      })
      .catch(() => {
        /* カレンダーは補助表示なので失敗しても操作は止めない */
      });
    return () => {
      cancelled = true;
    };
  }, [loadRange, monthFrom, monthTo, refreshKey]);

  // 日付→記録のマップ。編集中の日は保存前でも最新を反映する。
  const map = useMemo(() => {
    const m = new Map<string, DayRecord>();
    for (const d of days) m.set(d.date, d);
    if (liveDay && liveDay.date >= monthFrom && liveDay.date <= monthTo) {
      m.set(liveDay.date, liveDay);
    }
    return m;
  }, [days, liveDay, monthFrom, monthTo]);

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const lead = first.getDay(); // 日曜始まり
    const count = new Date(view.y, view.m + 1, 0).getDate();
    const out: (string | null)[] = [];
    for (let i = 0; i < lead; i++) out.push(null);
    for (let d = 1; d <= count; d++) {
      out.push(`${monthFrom.slice(0, 8)}${String(d).padStart(2, "0")}`);
    }
    return out;
  }, [view, monthFrom]);

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-surface p-4">
      <h2 className="font-bold text-slate-900">カレンダー</h2>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="前の月"
          onClick={() => shift(-1)}
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 hover:border-slate-400"
        >
          ←
        </button>
        <div className="font-mono text-sm font-semibold text-slate-900">
          {view.y}年{view.m + 1}月
        </div>
        <button
          type="button"
          aria-label="次の月"
          onClick={() => shift(1)}
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 hover:border-slate-400"
        >
          →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {DOW.map((w, i) => (
          <div
            key={w}
            className={`pb-0.5 text-center text-[11px] ${
              i === 6 ? "text-blue-500" : i === 0 ? "text-red-400" : "text-slate-400"
            }`}
          >
            {w}
          </div>
        ))}

        {cells.map((date, i) => {
          if (date === null) return <div key={`b${i}`} />;
          const d = map.get(date);
          const trained = d ? hasTraining(d) : false;
          const tone = gutTone(d);
          const isToday = date === today;
          const isSel = date === selectedDate;
          const dayNum = Number(date.slice(8, 10));

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              className={[
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border font-mono text-xs",
                tone === "ng"
                  ? "bg-rose-100"
                  : tone === "ok"
                    ? "bg-emerald-100"
                    : trained
                      ? "bg-sky-100"
                      : "bg-slate-50",
                trained ? "font-semibold text-sky-700" : "text-slate-600",
                isSel
                  ? "border-slate-900"
                  : isToday
                    ? "border-slate-400"
                    : "border-transparent",
              ].join(" ")}
            >
              <span>{dayNum}</span>
              <span className="flex h-1.5 items-center gap-[2px]">
                {trained && <Dot className="bg-sky-600" />}
                {d && hasYoga(d) && <Dot className="bg-violet-500" />}
                {d && hasMeals(d) && <Dot className="bg-amber-600" />}
                {d && hasBody(d) && <Dot className="bg-slate-400" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <Legend className="bg-sky-600">トレーニング</Legend>
        <Legend className="bg-violet-500">ヨガ</Legend>
        <Legend className="bg-amber-600">食事</Legend>
        <Legend className="bg-slate-400">体組成</Legend>
        <button
          type="button"
          onClick={() => {
            const d = new Date();
            setView({ y: d.getFullYear(), m: d.getMonth() });
            onSelect(today);
          }}
          className="ml-auto rounded-md border border-slate-300 px-2 py-0.5 text-slate-600 hover:border-slate-500"
        >
          今日へ
        </button>
      </div>
    </section>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`h-[5px] w-[5px] rounded-full ${className}`} />;
}

function Legend({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-[5px] w-[5px] rounded-full ${className}`} />
      {children}
    </span>
  );
}
