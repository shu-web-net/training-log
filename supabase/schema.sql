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
