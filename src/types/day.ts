// 1日分の記録（days テーブル1行）の型。
// JSON カラムの構造は CLAUDE.md「3. データ設計」に対応する。

/** トレーニングの単位。入力UIのプルダウンと対応。 */
export type Unit = "回" | "分" | "秒" | "歩" | "km";

/** トレーニング1行：種目名＋数値＋単位。 */
export interface TrainingSet {
  id: string;
  name: string;
  value: number | null;
  unit: Unit;
}

/** 体組成の片側（朝 or 夜）。未入力は null。 */
export interface BodyMeasure {
  weight: number | null; // 体重 kg
  fat: number | null; // 体脂肪率 %
  smm: number | null; // 骨格筋率 %
}

/** 体組成：朝(am)・夜(pm)。 */
export interface Body {
  am: BodyMeasure;
  pm: BodyMeasure;
}

/** 食事のスロット。 */
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

/** 食べたもの1行：スロット＋自由入力。 */
export interface Meal {
  id: string;
  slot: MealSlot;
  text: string;
}

/** ヨガのチェック：朝・夜。 */
export interface Habits {
  amYoga: boolean;
  pmYoga: boolean;
}

/** 腸の調子の3段階。○=ok / △=mid / ×=ng。未入力は undefined。 */
export type GutState = "ok" | "mid" | "ng";

/** 腸の調子：昼・夜。 */
export interface Gut {
  noon?: GutState;
  night?: GutState;
}

/**
 * アプリ内で扱う1日分の記録。
 * date は "YYYY-MM-DD" 文字列で持ち、タイムゾーン変換を挟まない（Asia/Tokyo 固定運用）。
 */
export interface DayRecord {
  date: string; // "YYYY-MM-DD"
  sets: TrainingSet[];
  body: Body;
  meals: Meal[];
  habits: Habits;
  gut: Gut;
  memo: string;
}

/**
 * days テーブルの行の形（DBとのやり取り用）。
 * id / user_id / updated_at はサーバ側が管理する。
 */
export interface DayRow {
  id: string;
  user_id: string;
  date: string;
  sets: TrainingSet[];
  body: Body;
  meals: Meal[];
  habits: Habits;
  gut: Gut;
  memo: string;
  updated_at: string;
}
