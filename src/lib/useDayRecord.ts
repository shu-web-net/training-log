"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { blankDay, loadDay, saveDay } from "@/lib/day";
import type { DayRecord } from "@/types/day";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;

/**
 * 選択中の日の記録を読み込み、編集を自動保存するフック。
 *
 * 自動保存の方針（CLAUDE.md 5）:
 *  1. 編集はまず画面状態を更新（待たせない）
 *  2. 入力が止まって 800ms 後に、その日のレコードをまとめて upsert
 *  3. 状態表示：保存中… → 保存しました／失敗は再試行
 *  4. 保存中に次の編集が来たら、終わってから最新だけを送る（後勝ち）
 *  5. フィールド単位では送らず、日単位でまとめる
 */
export function useDayRecord(userId: string, date: string) {
  const supabase = useMemo(() => createClient(), []);
  const [day, setDay] = useState<DayRecord | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const dirtyRef = useRef<DayRecord | null>(null); // 未保存の最新。null なら保存待ちなし
  const savingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 実際の保存。保存中なら何もしない（進行中のループが新しい dirty を拾う）。
  // 保存中に編集が来ても取りこぼさないよう、dirty が無くなるまで最新を送り続ける。
  const flush = useCallback(async () => {
    if (savingRef.current || !dirtyRef.current) return;
    savingRef.current = true;
    try {
      while (dirtyRef.current) {
        const toSave = dirtyRef.current;
        dirtyRef.current = null;
        setStatus("saving");
        try {
          await saveDay(supabase, userId, toSave);
        } catch {
          dirtyRef.current = toSave; // 失敗分は残し、再試行／次の編集で再送
          setStatus("error");
          return;
        }
      }
      setStatus("saved");
    } finally {
      savingRef.current = false;
    }
  }, [supabase, userId]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(), DEBOUNCE_MS);
  }, [flush]);

  // 読み込み中かどうかは派生で判定する（effect 内で同期 setState しないため）。
  // 保持している day が現在の日付と一致しない間は、新しい日付を読み込み中とみなす。
  const loading = day === null || day.date !== date;

  // 日付が変わったら読み込む。
  useEffect(() => {
    let cancelled = false;
    loadDay(supabase, date)
      .then((d) => {
        if (!cancelled) {
          setDay(d);
          setStatus("idle");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDay(blankDay(date));
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, date]);

  // 日付の切り替え・アンマウント時に、未保存の変更を取りこぼさない。
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dirtyRef.current && !savingRef.current) void flush();
    };
  }, [date, flush]);

  /** 編集を適用する。画面状態を即更新し、保存を予約する。 */
  const update = useCallback(
    (updater: (prev: DayRecord) => DayRecord) => {
      setDay((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        dirtyRef.current = next;
        return next;
      });
      scheduleSave();
    },
    [scheduleSave],
  );

  /** 保存に失敗したときの再試行。 */
  const retry = useCallback(() => void flush(), [flush]);

  return { day, loading, status, update, retry };
}
