import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FEATURES: { title: string; body: string }[] = [
  {
    title: "毎日の記録をまとめて",
    body: "トレーニング・体組成・ヨガ・食事・腸の調子・メモを、1日1画面で。入力が止まると自動で保存します。",
  },
  {
    title: "振り返りがひと目で",
    body: "連続日数や今週・今月の回数、朝夜の体重を集計。カレンダーに記録の有無がドットで並びます。",
  },
  {
    title: "体重の推移を折れ線で",
    body: "朝・夜の2本の折れ線を、30日・90日・1年で切り替え。体脂肪率・骨格筋率にも切り替えられます。",
  },
];

/** トップ（未ログイン向けの紹介）。ログイン済みなら記録画面へ。 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app");

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <span className="font-bold text-slate-900">トレーニング記録</span>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
        >
          ログイン
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4">
        <section className="py-12 text-center sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            続けた分だけ、積み上がる。
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            トレーニング・体組成・体調を、毎日かんたんに記録。
            自動保存と振り返りで、続けやすさを大切にした記録アプリです。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700"
            >
              はじめる（無料）
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              デモを見る
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-12 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <h2 className="font-bold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.body}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-4xl px-4 py-8 text-center text-xs text-slate-400">
        健康データを預かるため、記録はログインした本人だけが見られます。
      </footer>
    </div>
  );
}
