import type { SaveStatus as Status } from "@/lib/useDayRecord";

/** 自動保存の状態表示。失敗時だけ再試行ボタンを出す。 */
export default function SaveStatus({
  status,
  onRetry,
}: {
  status: Status;
  onRetry: () => void;
}) {
  if (status === "saving") {
    return <span className="text-sm text-slate-400">保存中…</span>;
  }
  if (status === "saved") {
    return <span className="text-sm text-green-600">保存しました</span>;
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-2 text-sm text-red-600">
        保存できませんでした
        <button
          type="button"
          onClick={onRetry}
          className="rounded border border-red-300 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          再試行
        </button>
      </span>
    );
  }
  return null;
}
