import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

/**
 * 記録画面まわり（/app 配下）の共通レイアウト。
 * ここでログイン必須を担保する。未ログインなら /login へ。
 * middleware でもセッションを更新しているが、アクセス制御はここで明示する。
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden font-bold text-slate-900 sm:inline">
              トレーニング記録
            </span>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/app"
                className="rounded-md px-2.5 py-1 text-slate-600 hover:bg-slate-100"
              >
                記録
              </Link>
              <Link
                href="/app/trends"
                className="rounded-md px-2.5 py-1 text-slate-600 hover:bg-slate-100"
              >
                推移
              </Link>
              <Link
                href="/app/settings"
                className="rounded-md px-2.5 py-1 text-slate-600 hover:bg-slate-100"
              >
                設定
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
