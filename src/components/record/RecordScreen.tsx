"use client";

import { useState } from "react";
import { addDays, todayStr } from "@/lib/date";
import { useDayRecord } from "@/lib/useDayRecord";
import DateBar from "@/components/record/DateBar";
import SaveStatus from "@/components/record/SaveStatus";
import TrainingSection from "@/components/record/TrainingSection";
import BodySection from "@/components/record/BodySection";
import MemoSection from "@/components/record/MemoSection";
import type { BodyMeasure, TrainingSet } from "@/types/day";

/** 記録画面（メイン）。日付の移動と各入力を自動保存につなぐ。 */
export default function RecordScreen({ userId }: { userId: string }) {
  const [date, setDate] = useState<string>(todayStr());
  const { day, loading, status, update, retry } = useDayRecord(userId, date);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">記録</h1>
        <SaveStatus status={status} onRetry={retry} />
      </div>

      <DateBar
        date={date}
        onPrev={() => setDate((d) => addDays(d, -1))}
        onNext={() => setDate((d) => addDays(d, 1))}
        onToday={() => setDate(todayStr())}
      />

      {loading || day === null ? (
        <p className="py-10 text-center text-sm text-slate-400">
          読み込み中…
        </p>
      ) : (
        <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-4">
          <TrainingSection
            sets={day.sets}
            onAdd={(set: TrainingSet) =>
              update((prev) => ({ ...prev, sets: [...prev.sets, set] }))
            }
            onUpdate={(id, patch) =>
              update((prev) => ({
                ...prev,
                sets: prev.sets.map((s) =>
                  s.id === id ? { ...s, ...patch } : s,
                ),
              }))
            }
            onRemove={(id) =>
              update((prev) => ({
                ...prev,
                sets: prev.sets.filter((s) => s.id !== id),
              }))
            }
          />

          <BodySection
            body={day.body}
            onChange={(slot, field: keyof BodyMeasure, value) =>
              update((prev) => ({
                ...prev,
                body: {
                  ...prev.body,
                  [slot]: { ...prev.body[slot], [field]: value },
                },
              }))
            }
          />

          <MemoSection
            memo={day.memo}
            onChange={(memo) => update((prev) => ({ ...prev, memo }))}
          />
        </div>
      )}
    </div>
  );
}
