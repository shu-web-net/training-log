/**
 * 記録画面（メイン）。
 * いまは土台だけ。日付移動・トレーニング・体組成・メモ・自動保存は次の工程で実装する。
 */
export default function AppPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">今日の記録</h1>
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
        ログインできています。記録の入力フォームはこれから実装します
        <br />
        （日付移動・トレーニング・体組成・メモ・自動保存）。
      </p>
    </div>
  );
}
