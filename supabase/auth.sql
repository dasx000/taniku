-- Profil pengguna TANIKU (role admin/petani) + login pakai No HP/Email.
-- Jalankan SETELAH schema.sql (butuh schema "taniku" sudah dibuat lebih dulu).

create table if not exists taniku.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'petani')),
  full_name text not null,
  phone text unique,
  created_at timestamptz not null default now()
);

alter table taniku.profiles enable row level security;

-- User cuma boleh baca profilnya sendiri (dipakai setelah login untuk tahu role).
create policy "profiles_select_own" on taniku.profiles
  for select
  using (auth.uid() = id);

-- Resolusi identifier login (No HP) -> email akun di auth.users.
-- Dipanggil dari client SEBELUM signInWithPassword, hanya kalau input yang
-- diketik user bukan format email.
--
-- SECURITY DEFINER: perlu baca lintas RLS (profiles + auth.users) untuk mencari
-- match, tapi cuma mengembalikan satu string email -- tidak ada data profil lain
-- yang bocor ke pemanggil (anon).
create or replace function taniku.resolve_login_email(p_identifier text)
returns text
language sql
stable
security definer
set search_path = taniku, auth, pg_temp
as $$
  select u.email
  from taniku.profiles p
  join auth.users u on u.id = p.id
  where p.phone = p_identifier
  limit 1;
$$;

revoke all on function taniku.resolve_login_email(text) from public;
grant execute on function taniku.resolve_login_email(text) to anon, authenticated;

-- Catatan keamanan:
-- Tabel profiles ikut ter-grant SELECT ke anon/authenticated lewat "alter default
-- privileges" di schema.sql, tapi RLS di atas yang benar-benar membatasi baris:
-- anon (belum login) auth.uid()-nya null sehingga tidak match baris manapun, dan
-- user login cuma bisa lihat baris miliknya sendiri. resolve_login_email() bisa
-- baca lintas baris karena SECURITY DEFINER (jalan sebagai owner function).
