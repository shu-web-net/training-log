# トレーニング記録（training-log）

日々のトレーニング・体組成・体調をかんたんに記録し、振り返るための Web アプリです。
自動保存と、集計・カレンダー・折れ線グラフによる振り返りで「続けやすさ」を重視しています。

- **本番URL**：https://training-log.vercel.app
- **デモ（ログイン不要・架空データ）**：https://training-log.vercel.app/demo

> ログインせずに中身を見たい場合は、トップページの「デモを見る」から確認できます。

---

## 主な機能

- **ログイン**（メールアドレス＋パスワード／パスワード再設定）
- **日ごとの記録**（入力が止まると自動保存）
  - トレーニング：種目・量・単位（回／分／秒／歩／km）を複数行で
  - 体組成：朝・夜 × 体重・体脂肪率・骨格筋率
  - ヨガ：朝ヨガ・夜ヨガのチェック（今月の回数も表示）
  - 食べたもの：朝・昼・夜・間食 × 自由入力
  - 腸の調子：昼・夜を ○△×（もう一度押すと取り消し）
  - メモ
- **集計タイル**：連続日数・今週・今月・朝夜の体重（前回比つき）
- **カレンダー**：記録の有無をドット表示、腸の調子でマスの地色を変える
- **体重グラフ**：朝・夜の折れ線（30日／90日／1年、体重・体脂肪率・骨格筋率を切替）
- **最近の記録一覧**
- **デモモード**（ログイン不要の読み取り専用ビュー）
- **アカウント削除**（記録もすべて削除）／プライバシーポリシー

---

## 技術構成

| 領域 | 採用技術 |
|---|---|
| フロントエンド | Next.js 16（App Router）／React 19／TypeScript |
| スタイル | Tailwind CSS v4 |
| 認証・DB | Supabase（Auth ＋ Postgres、`@supabase/ssr`） |
| グラフ | ライブラリなし・SVG を自前実装 |
| ホスティング | Vercel |

---

## 設計上の決めごと

実装の背景にある判断をまとめます。

- **1日1レコード＋項目は JSON（jsonb）で保持**
  画面の単位（1日）と保存の単位をそろえ、`unique (user_id, date)` により保存は常に upsert。
  項目を増やしてもテーブル変更が起きないよう、トレーニングや食事などは jsonb に格納しています。

- **アクセス制御は DB 側（RLS）で担保**
  アプリの `if` 文だけに頼らず、PostgreSQL の行レベルセキュリティで「本人の行だけ」を読み書き可能にしています。公開キー（Publishable key）がブラウザに出ても、他人のデータは取得できません。

- **自動保存は「日単位でまとめて」**
  入力はまず画面状態を即更新し、800ms 入力が止まったら**その日ぶんをまとめて upsert**。保存中に次の編集が来たら、終わってから最新だけを送ります（後勝ち）。全項目が空になった日は行を削除し、集計にゴミを残しません。

- **グラフは SVG を自前実装**
  1年ぶん（365行程度）を一度に取得して期間は画面側で絞り込み。5日以上あいた区間は線を繋がず、点が多ければ線のみに切り替えます。

- **退会は service_role キーを使わず実現**
  `auth.users` の削除は公開キーではできないため、「ログイン中の本人だけ」を削除できる `security definer` 関数を用意し、ログイン済みユーザーにのみ実行を許可。`on delete cascade` で記録も確実に消えます。

- **日付は `YYYY-MM-DD` の文字列で統一**
  タイムゾーン変換を挟まず、Asia/Tokyo 前提で扱います。

- **Server / Client の境界を明確化**
  認証チェックやデータ取得は Server Component、入力フォームなど状態を持つ部分は Client Component に分離しています。

---

## ディレクトリ構成

```
src/
  app/
    page.tsx              トップ（未ログイン向け紹介）
    login/                ログイン・新規登録・パスワード再設定
    demo/                 デモ（ログイン不要・架空データ）
    privacy/              プライバシーポリシー
    app/                  ログイン必須エリア
      layout.tsx          認証チェック＋共通ヘッダー
      page.tsx            記録（メイン）
      trends/             体重グラフ＋最近の記録
      settings/           ログアウト・アカウント削除
  components/             画面ごとのコンポーネント
  lib/                    Supabase クライアント・日付/集計ロジック・自動保存フック
  types/                  型定義
supabase/
  schema.sql              days テーブル・RLS・退会用関数
```

---

## ローカルでの動かし方

### 必要なもの
- Node.js 20 以上
- Supabase プロジェクト（無料枠で可）

### 手順

```bash
# 1. 依存関係をインストール
npm install

# 2. 環境変数を設定（.env.example をコピー）
cp .env.example .env.local
# .env.local に Supabase の Project URL と Publishable key を記入する
```

`.env.local` の内容：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
```

```bash
# 3. Supabase の SQL Editor で supabase/schema.sql を実行
#    （days テーブル・RLS・退会用関数が作成される）

# 4. 開発サーバーを起動
npm run dev
# http://localhost:3000
```

### スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |
| `npm run lint` | ESLint |

---

## データベース

`days` テーブル（1ユーザー・1日・1行）に記録をまとめて保存します。
各項目は jsonb、アクセス制御は RLS ポリシー `own rows`、退会は `delete_current_user()` 関数で行います。
詳細は [`supabase/schema.sql`](./supabase/schema.sql) を参照してください。

---

## デプロイ

Vercel に GitHub リポジトリを接続し、`master` への push で自動デプロイされます。
Vercel の Environment Variables に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定します。

---

## 作者

Web コーダー・しゅう — [shu-web.jp](https://shu-web.jp/)

ポートフォリオ作品として、認証・DB・API・デプロイを含む Web アプリ開発の一連を実装しています。
