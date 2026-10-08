"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * 退会（アカウント削除）。記録もすべて消える不可逆の操作なので、
 * チェックを入れないと実行できないようにしている。
 * 削除は security definer 関数 delete_current_user() を RPC で呼ぶ。
 */
export default function DeleteAccount() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmed) return;
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("delete_current_user");
    if (error) {
      setError("削除できませんでした。時間をおいて再度お試しください。");
      setPending(false);
      return;
    }

    // 削除後はセッションも無効。サインアウトしてトップへ。
    await supabase.auth.signOut().catch(() => {});
    router.refresh();
    router.push("/");
  }

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
      <h2 className="font-bold text-rose-700">アカウントの削除</h2>
      <p className="mt-1 text-sm text-slate-600">
        アカウントと、これまでのすべての記録（トレーニング・体組成・食事・体調など）が
        完全に削除されます。<strong>この操作は取り消せません。</strong>
      </p>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="h-4 w-4 accent-rose-600"
        />
        記録がすべて削除されることを理解しました
      </label>

      {error && (
        <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={!confirmed || pending}
        className="mt-3 rounded-lg bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700 disabled:opacity-40"
      >
        {pending ? "削除中…" : "アカウントを削除する"}
      </button>
    </div>
  );
}
