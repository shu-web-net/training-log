-- training-log : days テーブル定義
-- Supabase ダッシュボードの SQL Editor に貼り付けて実行する。
-- 設計意図は CLAUDE.md「3. データ設計」を参照。1日1レコード／項目はJSON／RLSで保護。

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  sets jsonb not null default '[]'::jsonb,    -- [{id, name, value, unit}]
  body jsonb not null default '{}'::jsonb,    -- {am:{weight,fat,smm}, pm:{weight,fat,smm}}
  meals jsonb not null default '[]'::jsonb,   -- [{id, slot, text}]
  habits jsonb not null default '{}'::jsonb,  -- {amYoga:bool, pmYoga:bool}
  gut jsonb not null default '{}'::jsonb,     -- {noon:'ok'|'mid'|'ng', night:'ok'|'mid'|'ng'}
  memo text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists days_user_date_idx on days (user_id, date desc);

-- アクセス制御はDB側で担保する（アプリのif文だけで守らない）
alter table days enable row level security;

-- 既存ポリシーがあれば作り直せるように drop してから作成
drop policy if exists "own rows" on days;

create policy "own rows" on days
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 退会（アカウント削除）用の関数。
-- auth.users の削除は公開キー（anon/publishable）ではできないため、
-- 「ログイン中の本人だけ」を消せる関数を用意し、ログイン済みユーザーだけに許可する。
-- days は on delete cascade なので、ユーザー削除で記録もすべて自動で消える。
create or replace function public.delete_current_user()
  returns void                       -- 返り値なし（削除するだけ）
  language sql                       -- 中身は単純なSQL1文
  security definer                   -- 作成者（高権限）の権限で実行する＝公開キーでも auth.users を消せる
  set search_path = ''               -- 参照先スキーマを固定し、乗っ取り（検索パス経由の攻撃）を防ぐ
as $$
  -- 実行した本人（auth.uid()）の行だけを削除する。他人は消せない。
  delete from auth.users where id = auth.uid();
$$;

-- 既定の実行権限を剥奪し、未ログイン(anon)からは呼べないようにする
revoke all on function public.delete_current_user() from public, anon;
-- ログイン済みユーザーにだけ実行を許可する
grant execute on function public.delete_current_user() to authenticated;
