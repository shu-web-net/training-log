"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** 画面モード：ログイン / 新規登録 / パスワード再設定の申請。 */
type Mode = "login" | "signup" | "forgot";

const MODE_LABEL: Record<Mode, string> = {
  login: "ログイン",
  signup: "新規登録",
  forgot: "パスワード再設定",
};

/**
 * 認証フォーム（Client Component）。
 * Supabase のブラウザクライアントを直接呼び、成功後に /app へ遷移する。
 * フォームまわりは Client にする方針（CLAUDE.md 5. 実装上の決めごと）。
 */
export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // セッションは cookie に入る。server 側に反映させてから遷移する。
        router.refresh();
        router.push("/app");
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // メール確認は無効なので、この時点でログイン済み。
        router.refresh();
        router.push("/app");
        return;
      }

      // mode === "forgot"
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setInfo(
        "再設定用のメールを送信しました。届いたリンクから新しいパスワードを設定してください。",
      );
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 rounded-md px-3 py-2 font-medium transition ${
              mode === m
                ? "bg-surface text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <h1 className="mb-1 text-lg font-bold text-slate-900">
        {MODE_LABEL[mode]}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {mode === "forgot"
          ? "登録したメールアドレスに再設定リンクを送ります。"
          : "メールアドレスとパスワードで利用できます。"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          />
        </div>

        {mode !== "forgot" && (
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
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
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-on-primary transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "処理中…" : MODE_LABEL[mode]}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {mode === "forgot" ? (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="text-slate-500 underline hover:text-slate-700"
          >
            ログインに戻る
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchMode("forgot")}
            className="text-slate-500 underline hover:text-slate-700"
          >
            パスワードを忘れた場合
          </button>
        )}
      </div>
    </div>
  );
}

/** Supabase のエラーを日本語の表示文に変換する。 */
function toMessage(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (m.includes("invalid login credentials")) {
      return "メールアドレスまたはパスワードが違います。";
    }
    if (m.includes("user already registered")) {
      return "このメールアドレスは登録済みです。ログインしてください。";
    }
    if (m.includes("password should be at least")) {
      return "パスワードは6文字以上にしてください。";
    }
    return err.message;
  }
  return "エラーが発生しました。時間をおいて再度お試しください。";
}
