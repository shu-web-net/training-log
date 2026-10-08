"use client";

import { useEffect, useState } from "react";

type Pref = "light" | "dark" | "system";

const NEXT: Record<Pref, Pref> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const LABEL: Record<Pref, { icon: string; text: string }> = {
  light: { icon: "☀", text: "ライト" },
  dark: { icon: "🌙", text: "ダーク" },
  system: { icon: "🖥", text: "自動" },
};

/** 保存値を data-theme（light/dark）に反映する。 */
function apply(pref: Pref) {
  const dark =
    pref === "dark" ||
    (pref === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** テーマ切替（ライト → ダーク → 端末に合わせる を循環）。 */
export default function ThemeToggle() {
  const [pref, setPref] = useState<Pref>("system");
  const [mounted, setMounted] = useState(false);

  // マウント後に保存値を読む（SSRとの不一致を避ける）。
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Pref | null;
    const initial: Pref =
      saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : "system";
    // localStorage はブラウザ専用のため、マウント後に読んで反映する（意図的な副作用）。
    /* eslint-disable react-hooks/set-state-in-effect */
    setPref(initial);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 「端末に合わせる」ときは OS の切替にも追従する。
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  function cycle() {
    const next = NEXT[pref];
    setPref(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage が使えなくても表示は切り替える */
    }
    apply(next);
  }

  // マウント前はラベルを出さない（ちらつき防止）。
  const current = LABEL[pref];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`テーマ：${current.text}（押すと切替）`}
      title={`テーマ：${current.text}`}
      className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
    >
      <span aria-hidden>{current.icon}</span>
      <span className="hidden sm:inline">{mounted ? current.text : ""}</span>
    </button>
  );
}
