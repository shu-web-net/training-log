import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 でルート直下の認証・リダイレクト処理は "proxy" 規約に移行した
// （旧称 middleware）。リクエストごとに Supabase のセッションを更新する。
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // 静的ファイルや画像は除外し、ページ・APIのみセッション更新を通す。
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
