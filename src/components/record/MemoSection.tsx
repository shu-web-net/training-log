"use client";

import SectionLabel from "@/components/record/SectionLabel";

/** メモ・体調の自由入力。 */
export default function MemoSection({
  memo,
  onChange,
}: {
  memo: string;
  onChange: (memo: string) => void;
}) {
  return (
    <section>
      <SectionLabel>メモ・体調</SectionLabel>
      <textarea
        value={memo}
        onChange={(e) => onChange(e.target.value)}
        placeholder="調子、痛み、気づいたことなど"
        className="min-h-[64px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 leading-relaxed focus:border-slate-900 focus:outline-none"
      />
    </section>
  );
}
