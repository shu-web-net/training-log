import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecordScreen from "@/components/record/RecordScreen";

/**
 * 記録画面（メイン）。
 * レイアウトでログイン必須を担保しているが、保存に user_id が要るのでここでも取得する。
 */
export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { date } = await searchParams;
  return <RecordScreen userId={user.id} initialDate={date} />;
}
