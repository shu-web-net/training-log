import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 認証リンク（パスワード再設定など）のコールバック。
 * メールのリンクは確認コード付きで戻ってくるので、ここでセッションに交換し、
 * Cookie にセッションを張ってから目的のページ（next）へ送る。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // コードが無い／交換に失敗した場合はログインへ。
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
