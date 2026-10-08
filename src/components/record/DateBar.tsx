import {
  dowKind,
  dowLabel,
  monthDay,
  parseYmd,
  relativeLabel,
  todayStr,
} from "@/lib/date";

/** 編集中の日付の表示と前後移動。 */
export default function DateBar({
  date,
  onPrev,
  onNext,
  onToday,
}: {
  date: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const kind = dowKind(date);
  const isToday = date === todayStr();
  const year = parseYmd(date).getFullYear();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="前の日"
        className="h-10 w-10 flex-none rounded-lg border border-slate-200 bg-slate-50 text-xl text-slate-600 hover:border-slate-400"
      >
        ‹
      </button>

      <div className="min-w-0 flex-1 text-center">
        <div className="flex items-center justify-center gap-2 leading-tight">
          <span className="font-mono text-2xl font-semibold tabular-nums text-slate-900">
            {monthDay(date)}
          </span>
          <span
            className={`rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-sm font-bold ${
              kind === "sat"
                ? "text-blue-600"
                : kind === "sun"
                  ? "text-red-500"
                  : "text-slate-700"
            }`}
          >
            {dowLabel(date)}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span>
            {year}年・{relativeLabel(date)}
          </span>
          {!isToday && (
            <button
              type="button"
              onClick={onToday}
              className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:border-slate-500"
            >
              今日へ戻る
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="次の日"
        className="h-10 w-10 flex-none rounded-lg border border-slate-200 bg-slate-50 text-xl text-slate-600 hover:border-slate-400"
      >
        ›
      </button>
    </div>
  );
}
