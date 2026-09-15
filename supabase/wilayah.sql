-- Data referensi wilayah administrasi Indonesia (Provinsi/Kabupaten/Kecamatan/
-- Desa) sesuai Kepmendagri. Sengaja ditaruh di schema "public" (bukan "taniku")
-- karena ini data referensi umum yang berguna lintas-aplikasi -- bukan cuma
-- TaniKu -- jadi app lain yang connect ke project Supabase yang sama bisa
-- langsung pakai tanpa bikin tabel sendiri. "public" juga sudah otomatis
-- ter-expose ke Data API tanpa perlu tambah "Exposed schemas".
--
-- Dipakai untuk:
--   1. Form domisili di profil petani (dropdown bertingkat Provinsi -> ... -> Desa)
--   2. Kode wilayah adm4 (kode desa) untuk lookup fitur Cuaca ke API BMKG
--      (https://data.bmkg.go.id -- parameter "adm4" persis format kode di sini,
--      contoh "31.71.01.1001").
--
-- Sumber data: https://github.com/cahyadsn/wilayah (db/wilayah.sql, MIT License)
-- Data publik/referensi (bukan data pribadi user) -> RLS read-only untuk semua.

-- Catatan: induk_kode SENGAJA tidak diberi foreign key. Sumber data (Kepmendagri)
-- punya ~19 kode kecamatan yang dipakai sebagai induk oleh desa-desanya tapi
-- baris kecamatan itu sendiri tidak ada di dump (celah data dari sumbernya) --
-- FK ketat bikin proses import gagal di tengah jalan karena kasus ini.
create table if not exists public.wilayah (
  kode text primary key,
  nama text not null,
  level smallint not null check (level between 1 and 4), -- 1 provinsi, 2 kab/kota, 3 kecamatan, 4 desa/kelurahan
  induk_kode text
);

create index if not exists idx_wilayah_induk on public.wilayah(induk_kode);
create index if not exists idx_wilayah_level on public.wilayah(level);

create extension if not exists pg_trgm;
create index if not exists idx_wilayah_nama_trgm on public.wilayah using gin (nama gin_trgm_ops);

alter table public.wilayah enable row level security;

create policy "wilayah_public_read" on public.wilayah
  for select
  using (true);

grant select on public.wilayah to anon, authenticated, service_role;

-- Kolom domisili petani di profiles (nama wilayah didenormalisasi supaya
-- kartu cuaca/profil tidak perlu join berjenjang tiap render; kode_wilayah
-- (adm4) disimpan terpisah khusus buat panggil API BMKG). FK menunjuk ke
-- public.wilayah -- lintas schema, didukung penuh oleh Postgres.
alter table taniku.profiles add column if not exists provinsi text;
alter table taniku.profiles add column if not exists kabupaten text;
alter table taniku.profiles add column if not exists kecamatan text;
alter table taniku.profiles add column if not exists desa text;
alter table taniku.profiles add column if not exists kode_wilayah text references public.wilayah(kode);

-- Lanjutan dari policy "profiles_update_own" di profile-edit.sql: tambah
-- kolom domisili ke daftar kolom yang boleh diubah user sendiri.
grant update (provinsi, kabupaten, kecamatan, desa, kode_wilayah) on taniku.profiles to authenticated;
