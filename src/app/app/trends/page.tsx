import { redirect } from "next/navigation";

/**
 * 推移は記録画面（/app）に統合したため、このパスは /app へ転送する。
 * 旧ブックマークやリンク対策として残している。
 */
export default function TrendsPage() {
  redirect("/app");
}
