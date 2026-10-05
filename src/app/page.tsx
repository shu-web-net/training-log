import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * トップ。いまはログイン状態に応じて振り分けるだけ。
 * 未ログイン向けの紹介ページ（デモ導線つき）は第2週で作る。
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/app" : "/login");
}
