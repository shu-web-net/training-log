import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバ（Server Component / Route Handler / Server Action）用の Supabase クライアント。
 * Cookie にセッションを読み書きする。Next.js では cookies() が非同期なので await する。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component からの setAll は無視してよい。
            // セッション更新は middleware が担うため問題ない。
          }
        },
      },
    },
  );
}
