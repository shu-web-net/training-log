"use client";

import { useMemo } from "react";
import {
  latestWeight,
  monthCount,
  streak,
  trainedSet,
  weekCount,
} from "@/lib/stats";
import type { DayRecord } from "@/types/day";

/** 体重の前回比表示（減ったら緑・増えたら赤。±0.05未満は横ばい）。 */
function Diff({ diff }: { diff: number | null }) {
  if (diff === null) return null;
  if (Math.abs(diff) < 0.05) {
    return <span className="block text-xs text-slate-400">±0</span>;
  }
  const good = diff < 0; // 体重は減る方が良い
  return (
    <span
      className={`block text-xs ${good ? "text-emerald-600" : "text-rose-600"}`}
    >
      {diff > 0 ? "+" : ""}
      {diff.toFixed(1)}
    </span>
  );
}

/** 連続日数・今週・今月・朝夜の体重（前回比つき）のタイル。 */
export default function StatsTiles({ days }: { days: DayRecord[] }) {
  const stats = useMemo(() => {
    const t = trainedSet(days);
    return {
      streak: streak(t),
      week: weekCount(t),
      month: monthCount(t),
      am: latestWeight(days, "am"),
      pm: latestWeight(days, "pm"),
    };
  }, [days]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <Tile k="連続" v={stats.streak} unit="日" />
      <Tile k="今週" v={stats.week} unit="回" />
      <Tile k="今月" v={stats.month} unit="回" />
      <WeightTile k="朝 体重" accent="text-amber-700" data={stats.am} />
      <WeightTile k="夜 体重" accent="text-indigo-700" data={stats.pm} />
    </div>
  );
}

function Tile({ k, v, unit }: { k: string; v: number; unit: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-surface px-3 py-2">
      <div className="text-xs tracking-wider text-slate-400">{k}</div>
      <div className="font-mono text-xl font-semibold tabular-nums text-slate-900">
        {v}
        <span className="ml-0.5 font-sans text-xs font-normal text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

function WeightTile({
  k,
  accent,
  data,
}: {
  k: string;
  accent: string;
  data: { value: number; diff: number | null } | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-surface px-3 py-2">
      <div className={`text-xs tracking-wider ${accent}`}>{k}</div>
      {data === null ? (
        <div className="font-mono text-xl font-semibold text-slate-300">—</div>
      ) : (
        <div className="font-mono text-xl font-semibold tabular-nums text-slate-900">
          {data.value.toFixed(1)}
          <span className="ml-0.5 font-sans text-xs font-normal text-slate-400">
            kg
          </span>
          <Diff diff={data.diff} />
        </div>
      )}
    </div>
  );
}
