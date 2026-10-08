import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";
import DeleteAccount from "@/components/settings/DeleteAccount";

/** 設定ページ：ログイン情報・ログアウト・退会。 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">設定</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-bold text-slate-900">アカウント</h2>
        <p className="mt-1 text-sm text-slate-600">
          ログイン中のメールアドレス：
          <span className="font-medium text-slate-900">{user.email}</span>
        </p>
        <div className="mt-3">
          <LogoutButton />
        </div>
      </section>

      <DeleteAccount />

      <p className="text-center text-xs text-slate-400">
        データの取り扱いは
        <Link href="/privacy" className="text-sky-700 hover:underline">
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>
    </div>
  );
}
