import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Body,
  BodyMeasure,
  DayRecord,
  TrainingSet,
  Unit,
} from "@/types/day";

export const UNITS: Unit[] = ["回", "分", "秒", "歩", "km"];

/** 新規行用のID。 */
export function uid(): string {
  return crypto.randomUUID();
}

function emptyMeasure(): BodyMeasure {
  return { weight: null, fat: null, smm: null };
}

function emptyBody(): Body {
  return { am: emptyMeasure(), pm: emptyMeasure() };
}

/** まだ記録のない日の初期値。 */
export function blankDay(date: string): DayRecord {
  return {
    date,
    sets: [],
    body: emptyBody(),
    meals: [],
    habits: { amYoga: false, pmYoga: false },
    gut: {},
    memo: "",
  };
}

/** 数値だけ通す（NaN や非数は null）。 */
function num(v: unknown): number | null {
  return typeof v === "number" && isFinite(v) ? v : null;
}

function readMeasure(raw: unknown): BodyMeasure {
  const r = (raw ?? {}) as Record<string, unknown>;
  return { weight: num(r.weight), fat: num(r.fat), smm: num(r.smm) };
}

/**
 * DB から来た未知の形を、画面で扱える DayRecord に整える。
 * jsonb は何が入っているか保証されないので、ここで型を固める。
 */
export function normalizeDay(date: string, raw: unknown): DayRecord {
  const r = (raw ?? {}) as Record<string, unknown>;
  const body = (r.body ?? {}) as Record<string, unknown>;

  const sets: TrainingSet[] = Array.isArray(r.sets)
    ? (r.sets as unknown[])
        .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
        .map((s) => ({
          id: typeof s.id === "string" ? s.id : uid(),
          name: String(s.name ?? ""),
          value: num(s.value),
          unit: UNITS.includes(s.unit as Unit) ? (s.unit as Unit) : "回",
        }))
    : [];

  const meals = Array.isArray(r.meals)
    ? (r.meals as unknown[])
        .filter((m): m is Record<string, unknown> => !!m && typeof m === "object")
        .map((m) => ({
          id: typeof m.id === "string" ? m.id : uid(),
          slot: (["breakfast", "lunch", "dinner", "snack"].includes(
            m.slot as string,
          )
            ? m.slot
            : "breakfast") as DayRecord["meals"][number]["slot"],
          text: String(m.text ?? ""),
        }))
    : [];

  const habits = (r.habits ?? {}) as Record<string, unknown>;
  const gut = (r.gut ?? {}) as Record<string, unknown>;
  const gutOf = (v: unknown) =>
    v === "ok" || v === "mid" || v === "ng" ? v : undefined;

  return {
    date,
    sets,
    body: { am: readMeasure(body.am), pm: readMeasure(body.pm) },
    meals,
    habits: { amYoga: !!habits.amYoga, pmYoga: !!habits.pmYoga },
    gut: { noon: gutOf(gut.noon), night: gutOf(gut.night) },
    memo: typeof r.memo === "string" ? r.memo : "",
  };
}

function measureEmpty(m: BodyMeasure): boolean {
  return m.weight === null && m.fat === null && m.smm === null;
}

/** 全項目が空か（空なら保存せず行を消す判断に使う）。 */
export function isEmptyDay(d: DayRecord): boolean {
  return (
    d.sets.length === 0 &&
    d.meals.length === 0 &&
    measureEmpty(d.body.am) &&
    measureEmpty(d.body.pm) &&
    !d.habits.amYoga &&
    !d.habits.pmYoga &&
    !d.gut.noon &&
    !d.gut.night &&
    d.memo.trim() === ""
  );
}

/** その日の記録を読み込む。無ければ空の日を返す。 */
export async function loadDay(
  supabase: SupabaseClient,
  date: string,
): Promise<DayRecord> {
  const { data, error } = await supabase
    .from("days")
    .select("sets, body, meals, habits, gut, memo")
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  if (!data) return blankDay(date);
  return normalizeDay(date, data);
}

/**
 * その日の記録をまとめて保存する（日単位 upsert）。
 * 空なら行を削除して、カレンダー・集計にゴミを残さない。
 */
export async function saveDay(
  supabase: SupabaseClient,
  userId: string,
  d: DayRecord,
): Promise<void> {
  if (isEmptyDay(d)) {
    const { error } = await supabase
      .from("days")
      .delete()
      .eq("date", d.date);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("days").upsert(
    {
      user_id: userId,
      date: d.date,
      sets: d.sets,
      body: d.body,
      meals: d.meals,
      habits: d.habits,
      gut: d.gut,
      memo: d.memo,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" },
  );
  if (error) throw error;
}
