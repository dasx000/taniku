-- Data lahan pertanian milik masing-masing user (petani).
-- Beda dari tabel lain di schema taniku (yang isinya data publik/referensi),
-- tabel ini data PRIBADI per-user -- RLS membatasi tiap user cuma bisa
-- baca/tulis baris miliknya sendiri.

create table if not exists taniku.lahan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  luas_ha numeric not null check (luas_ha > 0),
  komoditas text,
  lokasi text,
  created_at timestamptz not null default now()
);

create index if not exists idx_lahan_user on taniku.lahan(user_id);

alter table taniku.lahan enable row level security;

create policy "lahan_select_own" on taniku.lahan
  for select
  using (auth.uid() = user_id);

create policy "lahan_insert_own" on taniku.lahan
  for insert
  with check (auth.uid() = user_id);

create policy "lahan_update_own" on taniku.lahan
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lahan_delete_own" on taniku.lahan
  for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on taniku.lahan to authenticated;
