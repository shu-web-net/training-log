"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * 新しいパスワードの設定画面（UI先行）。
 * 再設定メールのリンクから来るとリカバリ用セッションが張られ、updateUser で更新できる。
 * ※メール送信（SMTP）の本設定は後の工程。いまは画面と更新処理だけ用意しておく。
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(
        error.message.toLowerCase().includes("auth session missing")
          ? "リンクの有効期限が切れています。もう一度再設定を申請してください。"
          : error.message,
      );
      setPending(false);
      return;
    }

    setDone(true);
    setPending(false);
    router.refresh();
    router.push("/app");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-lg font-bold text-slate-900">
          新しいパスワードの設定
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          新しいパスワードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              新しいパスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-16 text-slate-900 outline-none focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-2 my-auto h-fit rounded px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {showPassword ? "隠す" : "表示"}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || done}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "更新中…" : "パスワードを更新"}
          </button>
        </form>
      </div>
    </main>
  );
}
