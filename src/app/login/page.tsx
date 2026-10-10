import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/auth/AuthForm";

/**
 * ログイン・新規登録・パスワード再設定の画面。
 * すでにログイン済みなら記録画面へ送る。
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4 py-10">
      <Link
        href="/"
        className="absolute left-4 top-4 text-sm text-slate-500 hover:text-slate-700 hover:underline"
      >
        ← トップへ
      </Link>
      <AuthForm />
      <p className="max-w-sm rounded-lg border border-amber-700/30 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
        ※ ポートフォリオ用の制作実績です。実サービスとしての継続運用はしておらず、記録は予告なく削除・初期化される場合があります。
      </p>
      <Link href="/privacy" className="text-xs text-slate-400 hover:underline">
        プライバシーポリシー
      </Link>
    </main>
  );
}
