import type { Metadata } from "next";
import DemoScreen from "@/components/demo/DemoScreen";

export const metadata: Metadata = {
  title: "デモ｜トレーニング記録",
  description: "ログイン不要で中身を見られるデモ（架空データ・読み取り専用）",
};

/** デモページ：ログイン不要・架空データの読み取り専用ビュー。 */
export default function DemoPage() {
  return <DemoScreen />;
}
