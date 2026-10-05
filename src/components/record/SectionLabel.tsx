/** 各入力セクションの見出し（細い区切り線つき）。 */
export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs tracking-wider text-slate-400">
      {children}
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
