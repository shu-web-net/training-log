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
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <AuthForm />
    </main>
  );
}
