// 日付は "YYYY-MM-DD" の文字列で扱い、タイムゾーン変換を挟まない。
// 本人は Asia/Tokyo 固定運用（CLAUDE.md 5. 全般）。ローカル時刻の年月日をそのまま使う。

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date → "YYYY-MM-DD"（ローカル時刻ベース）。 */
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" → Date（ローカル0時）。 */
export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 今日の "YYYY-MM-DD"。 */
export function todayStr(): string {
  return ymd(new Date());
}

/** 文字列日付に日数を足した "YYYY-MM-DD"。 */
export function addDays(s: string, delta: number): string {
  const d = parseYmd(s);
  d.setDate(d.getDate() + delta);
  return ymd(d);
}

/** 曜日ラベル（"日"〜"土"）。 */
export function dowLabel(s: string): string {
  return DOW[parseYmd(s).getDay()];
}

/** 曜日の種別（土・日だけ色を変えるため）。 */
export function dowKind(s: string): "sat" | "sun" | "" {
  const w = parseYmd(s).getDay();
  return w === 6 ? "sat" : w === 0 ? "sun" : "";
}

/** 今日を基準にした相対ラベル（例：今日／昨日／3日前／2日後）。 */
export function relativeLabel(s: string): string {
  const diff = Math.round(
    (parseYmd(todayStr()).getTime() - parseYmd(s).getTime()) / 86400000,
  );
  if (diff === 0) return "今日の記録";
  if (diff === 1) return "昨日の記録";
  if (diff === 2) return "おとといの記録";
  if (diff > 0) return `${diff}日前の記録`;
  return `${-diff}日後（未来）の記録`;
}

/** 表示用の "M/D"。 */
export function monthDay(s: string): string {
  const d = parseYmd(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
