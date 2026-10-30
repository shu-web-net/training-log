/**
 * 各入力セクションの見出し。
 * 左にアクセントバー（色）＋少し大きめの太字で、画面内の区切りを掴みやすくする。
 * 色は indigo のバーだけに持たせ、文字は濃いスレートにして可読性を優先
 * （小さな日本語見出しは文字を着色すると読みにくくなるため）。
 * 色・スレートともダークモードのトークンで両テーマに対応している。
 */
export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2">
      <span
        aria-hidden
        className="h-5 w-1.5 flex-none rounded-full bg-indigo-500"
      />
      <span className="text-base font-semibold tracking-wide text-slate-800">
        {children}
      </span>
      <span aria-hidden className="h-px flex-1 bg-slate-200" />
    </h3>
  );
}
