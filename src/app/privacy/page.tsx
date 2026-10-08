import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜トレーニング記録",
  description: "トレーニング記録アプリの個人情報・健康データの取り扱いについて",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <div className="mt-1 space-y-2 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

/** プライバシーポリシー（公開ページ）。 */
export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-bold text-slate-900">
          トレーニング記録
        </Link>
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
        >
          トップへ
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        <h1 className="text-2xl font-bold text-slate-900">
          プライバシーポリシー
        </h1>
        <p className="mt-2 text-sm text-slate-500">施行日：2026年10月8日</p>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          本アプリ「トレーニング記録」（以下「本サービス」）における、利用者の個人情報および健康に関する記録の取り扱いについて定めます。本サービスは健康に関するデータを預かるため、取り扱いを明確にします。
        </p>

        <Section title="1. 取得する情報">
          <ul className="list-disc space-y-1 pl-5">
            <li>アカウント情報：メールアドレス（ログインのため）</li>
            <li>
              記録データ：トレーニング（種目・量）、体組成（体重・体脂肪率・骨格筋率）、ヨガの実施、食べたもの、腸の調子、メモなど、利用者が自身で入力した内容
            </li>
          </ul>
          <p>
            広告や行動解析のための情報（トラッキングCookie等）は取得しません。
          </p>
        </Section>

        <Section title="2. 利用目的">
          <p>
            取得した情報は、利用者本人が自分の記録を保存・表示・振り返るためだけに利用します。これ以外の目的には利用しません。
          </p>
        </Section>

        <Section title="3. 保管と委託">
          <p>
            データはデータベースおよび認証基盤として Supabase を、ホスティングとして
            Vercel を利用して保管・提供します。これらの事業者のサーバーは日本国外に設置される場合があります。通信は暗号化（HTTPS）されます。
          </p>
        </Section>

        <Section title="4. アクセス制御">
          <p>
            記録データには行レベルセキュリティ（RLS）を設定しており、ログインした本人以外は閲覧できません。運営者であっても、通常の運用において個々の記録内容を閲覧することはありません。
          </p>
        </Section>

        <Section title="5. 第三者提供">
          <p>
            法令に基づく場合を除き、取得した情報を第三者に提供・販売することはありません。
          </p>
        </Section>

        <Section title="6. Cookie（クッキー）">
          <p>
            ログイン状態を保持するために必要最小限のCookie（セッション）のみを使用します。広告・解析目的のCookieは使用しません。
          </p>
        </Section>

        <Section title="7. データの削除（退会）">
          <p>
            設定ページの「アカウントの削除」から、いつでも退会できます。退会すると、アカウントとこれまでのすべての記録が直ちに完全に削除され、復元できません。
          </p>
        </Section>

        <Section title="8. お問い合わせ">
          <p>
            本ポリシーに関するお問い合わせは、運営者のサイト（
            <a
              href="https://shu-web.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-700 hover:underline"
            >
              shu-web.jp
            </a>
            ）よりご連絡ください。
          </p>
        </Section>

        <Section title="9. 改定">
          <p>
            本ポリシーは必要に応じて改定することがあります。重要な変更がある場合は、本ページ上で告知します。
          </p>
        </Section>
      </main>
    </div>
  );
}
