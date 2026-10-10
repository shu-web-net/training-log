"use client";

import TrainingSection from "@/components/record/TrainingSection";
import YogaSection from "@/components/record/YogaSection";
import BodySection from "@/components/record/BodySection";
import MealsSection from "@/components/record/MealsSection";
import GutSection from "@/components/record/GutSection";
import MemoSection from "@/components/record/MemoSection";
import type {
  BodyMeasure,
  DayRecord,
  Habits,
  Meal,
  TrainingSet,
} from "@/types/day";

/**
 * 1日分の入力フォーム（トレーニング・ヨガ・体組成・食事・腸・メモ）。
 * 本番（Supabaseへ自動保存）とデモ（メモリ上のみ）で共用する。
 * 保存の有無は呼び出し側の update に委ねる。
 */
export default function RecordForm({
  day,
  monthCounts,
  update,
}: {
  day: DayRecord;
  monthCounts: Record<keyof Habits, number>;
  update: (updater: (prev: DayRecord) => DayRecord) => void;
}) {
  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-surface p-4">
      <TrainingSection
        sets={day.sets}
        onAdd={(set: TrainingSet) =>
          update((prev) => ({ ...prev, sets: [...prev.sets, set] }))
        }
        onUpdate={(id, patch) =>
          update((prev) => ({
            ...prev,
            sets: prev.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          }))
        }
        onRemove={(id) =>
          update((prev) => ({
            ...prev,
            sets: prev.sets.filter((s) => s.id !== id),
          }))
        }
      />

      <YogaSection
        habits={day.habits}
        monthCounts={monthCounts}
        onToggle={(key, value) =>
          update((prev) => ({
            ...prev,
            habits: { ...prev.habits, [key]: value },
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

      <MealsSection
        meals={day.meals}
        onAdd={(meal: Meal) =>
          update((prev) => ({ ...prev, meals: [...prev.meals, meal] }))
        }
        onUpdate={(id, patch) =>
          update((prev) => ({
            ...prev,
            meals: prev.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
          }))
        }
        onRemove={(id) =>
          update((prev) => ({
            ...prev,
            meals: prev.meals.filter((m) => m.id !== id),
          }))
        }
      />

      <GutSection
        gut={day.gut}
        onSet={(key, value) =>
          update((prev) => ({
            ...prev,
            gut: { ...prev.gut, [key]: value },
          }))
        }
      />

      <MemoSection
        memo={day.memo}
        onChange={(memo) => update((prev) => ({ ...prev, memo }))}
      />
    </div>
  );
}
