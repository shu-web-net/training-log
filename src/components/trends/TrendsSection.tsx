"use client";

import { useEffect, useMemo, useState } from "react";
import { parseYmd } from "@/lib/date";
import { measureSeries } from "@/lib/stats";
import WeightChart, { type ChartPoint } from "@/components/trends/WeightChart";
import Switcher from "@/components/ui/Switcher";
import type { BodyMeasure, DayRecord } from "@/types/day";

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

/** 選択を localStorage に退避・復元する（try/catch で囲む）。 */
function loadPref<T>(key: string, fallback: T, valid: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return valid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function toPoints(series: { date: string; v: number }[]): ChartPoint[] {
  return series.map((r) => ({ t: parseYmd(r.date).getTime(), v: r.v, date: r.date }));
}

function filterRange(am: ChartPoint[], pm: ChartPoint[], range: Range) {
  const all = [...am, ...pm];
  if (!all.length) return { am, pm };
  const lastT = Math.max(...all.map((p) => p.t));
  const from = lastT - range * DAY;
  const f = (pts: ChartPoint[]) => pts.filter((p) => p.t > from);
  return { am: f(am), pm: f(pm) };
}

/**
 * 体組成の推移（朝・夜の折れ線）。項目・期間を切り替えられる。
 * データは呼び出し側から受け取る（本番・デモ共用）。選択は localStorage に保存。
 */
export default function TrendsSection({ days }: { days: DayRecord[] }) {
  const [metric, setMetric] = useState<Metric>("weight");
  const [range, setRange] = useState<Range>(30);

  // 保存済みの選択を復元（マウント後。SSRとの不一致を避ける）。
  useEffect(() => {
    const m = loadPref<Metric>("trends.metric", "weight", (v) =>
      ["weight", "fat", "smm"].includes(v as string),
    );
    const r = loadPref<Range>("trends.range", 30, (v) =>
      [30, 90, 365].includes(v as number),
    );
    /* eslint-disable react-hooks/set-state-in-effect */
    setMetric(m);
    setRange(r);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function chooseMetric(m: Metric) {
    setMetric(m);
    try {
      localStorage.setItem("trends.metric", JSON.stringify(m));
    } catch {
      /* localStorage が使えなくても機能は続ける */
    }
  }
  function chooseRange(r: Range) {
    setRange(r);
    try {
      localStorage.setItem("trends.range", JSON.stringify(r));
    } catch {
      /* 同上 */
    }
  }

  const current = METRICS.find((m) => m.value === metric)!;
  const { am, pm } = useMemo(() => {
    const amPts = toPoints(measureSeries(days, "am", metric));
    const pmPts = toPoints(measureSeries(days, "pm", metric));
    return filterRange(amPts, pmPts, range);
  }, [days, metric, range]);

  return (
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
      <Switcher options={METRICS} value={metric} onChange={chooseMetric} ariaLabel="項目" />
      <Switcher options={RANGES} value={range} onChange={chooseRange} ariaLabel="期間" />
      <WeightChart am={am} pm={pm} unit={current.unit} />
    </section>
  );
}
