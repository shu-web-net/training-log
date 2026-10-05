"use client";

import { useMemo, useRef, useState } from "react";
import { dowLabel, ymd } from "@/lib/date";

export interface ChartPoint {
  t: number; // ミリ秒
  v: number;
  date: string;
}

interface Geom {
  t0: number;
  t1: number;
  x: (t: number) => number;
  y: (v: number) => number;
  ticks: number[];
  dateTicks: number[];
  byT: Map<number, { am?: number; pm?: number }>;
  stamps: number[];
}

const W = 640;
const H = 220;
const PAD = { l: 40, r: 36, t: 12, b: 24 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;
const DAY = 86400000;

const AM_COLOR = "#b45309"; // amber-700
const PM_COLOR = "#4338ca"; // indigo-700

/** >5日あいたところで線を分割する（欠損を直線で繋がない）。 */
function splitRuns(points: ChartPoint[]): ChartPoint[][] {
  if (!points.length) return [];
  const runs: ChartPoint[][] = [[points[0]]];
  for (let i = 1; i < points.length; i++) {
    if (points[i].t - points[i - 1].t > 5 * DAY) runs.push([points[i]]);
    else runs[runs.length - 1].push(points[i]);
  }
  return runs;
}

/** 朝・夜の折れ線グラフ。体重など1項目を表示する。 */
export default function WeightChart({
  am,
  pm,
  unit,
}: {
  am: ChartPoint[];
  pm: ChartPoint[];
  unit: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    t: number;
    px: number; // viewBox 座標の x（SVG のクロスヘア用）
    left: number; // tooltip の左位置（CSS px）
    am?: number;
    pm?: number;
    date: string;
  } | null>(null);

  const geom = useMemo<Geom | null>(() => {
    const all = [...am, ...pm];
    if (!all.length) return null;

    let t0 = Math.min(...all.map((p) => p.t));
    let t1 = Math.max(...all.map((p) => p.t));
    if (t1 === t0) {
      t0 -= DAY;
      t1 += DAY;
    }
    let lo = Math.min(...all.map((p) => p.v));
    let hi = Math.max(...all.map((p) => p.v));
    const span = hi - lo;
    if (span < 0.4) {
      const mid = (hi + lo) / 2;
      lo = mid - 0.5;
      hi = mid + 0.5;
    } else {
      lo -= span * 0.12;
      hi += span * 0.12;
    }

    const x = (t: number) => PAD.l + ((t - t0) / (t1 - t0)) * IW;
    const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * IH;

    const ticks = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * i) / 3);
    const dateTicks = [t0, (t0 + t1) / 2, t1];

    const byT = new Map<number, { am?: number; pm?: number }>();
    for (const p of am) byT.set(p.t, { ...byT.get(p.t), am: p.v });
    for (const p of pm) byT.set(p.t, { ...byT.get(p.t), pm: p.v });
    const stamps = [...byT.keys()].sort((a, b) => a - b);

    return { t0, t1, x, y, ticks, dateTicks, byT, stamps };
  }, [am, pm]);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!geom || !wrapRef.current) return;
    const box = wrapRef.current.getBoundingClientRect();
    if (!box.width) return;
    const scale = W / box.width;
    const px = (e.clientX - box.left) * scale;
    const t = geom.t0 + ((px - PAD.l) / IW) * (geom.t1 - geom.t0);
    let best = geom.stamps[0];
    let bd = Infinity;
    for (const s of geom.stamps) {
      const d = Math.abs(s - t);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    const row = geom.byT.get(best)!;
    // tooltip の左位置を CSS px で算出（描画中に ref を読まないため、ここで確定させる）。
    const cssX = (geom.x(best) / W) * box.width;
    let left = cssX + 12;
    if (left + 128 > box.width) left = cssX - 128 - 12;
    setHover({
      t: best,
      px: geom.x(best),
      left: Math.max(0, left),
      am: row.am,
      pm: row.pm,
      date: ymd(new Date(best)),
    });
  }

  if (!geom) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        2日以上記録すると、ここに朝と夜の折れ線が出ます。
      </p>
    );
  }

  const radius = (pts: ChartPoint[]) => (pts.length > 14 ? 0 : 3.2);

  return (
    <div
      ref={wrapRef}
      className="relative touch-pan-y"
      onPointerMove={handleMove}
      onPointerDown={handleMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="block h-auto w-full"
        role="img"
        aria-label="朝と夜の推移"
      >
        {geom.ticks.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.l}
              y1={geom.y(v)}
              x2={W - PAD.r}
              y2={geom.y(v)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={PAD.l - 7}
              y={geom.y(v) + 3.5}
              textAnchor="end"
              fontSize={10.5}
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        {geom.dateTicks.map((t, i) => {
          const d = new Date(t);
          const anchor = i === 0 ? "start" : i === 2 ? "end" : "middle";
          return (
            <text
              key={i}
              x={geom.x(t)}
              y={H - 7}
              textAnchor={anchor}
              fontSize={10.5}
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
            >
              {d.getMonth() + 1}/{d.getDate()}
            </text>
          );
        })}

        {hover && (
          <line
            x1={hover.px}
            y1={PAD.t}
            x2={hover.px}
            y2={PAD.t + IH}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        <Series points={am} color={AM_COLOR} label="朝" geom={geom} radius={radius(am)} />
        <Series points={pm} color={PM_COLOR} label="夜" geom={geom} radius={radius(pm)} />
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[112px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: hover.left }}
        >
          <div className="font-mono text-slate-400">
            {new Date(hover.t).getMonth() + 1}/{new Date(hover.t).getDate()}（
            {dowLabel(hover.date)}）
          </div>
          <div className="font-mono">
            <span
              className="mr-1 inline-block h-[3px] w-3.5 rounded-sm align-middle"
              style={{ background: AM_COLOR }}
            />
            朝 <b>{hover.am === undefined ? "—" : hover.am.toFixed(1)}</b>
            {hover.am === undefined ? "" : unit}
          </div>
          <div className="font-mono">
            <span
              className="mr-1 inline-block h-[3px] w-3.5 rounded-sm align-middle"
              style={{ background: PM_COLOR }}
            />
            夜 <b>{hover.pm === undefined ? "—" : hover.pm.toFixed(1)}</b>
            {hover.pm === undefined ? "" : unit}
          </div>
        </div>
      )}
    </div>
  );
}

function Series({
  points,
  color,
  label,
  geom,
  radius,
}: {
  points: ChartPoint[];
  color: string;
  label: string;
  geom: Geom;
  radius: number;
}) {
  if (!points.length) return null;
  const runs = splitRuns(points).filter((r) => r.length > 1);
  const last = points[points.length - 1];
  return (
    <g>
      {runs.map((run, i) => (
        <path
          key={i}
          d={run
            .map(
              (p, j) =>
                `${j ? "L" : "M"}${geom.x(p.t).toFixed(1)} ${geom.y(p.v).toFixed(1)}`,
            )
            .join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {radius > 0 &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={geom.x(p.t)}
            cy={geom.y(p.v)}
            r={radius}
            fill={color}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        ))}
      <text
        x={geom.x(last.t) + 6}
        y={geom.y(last.v) + 3.5}
        fontSize={11}
        fontWeight={600}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}
