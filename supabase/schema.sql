-- Schema untuk fitur "Kendali OPT" (komoditas + OPT -> bahan aktif + rekomendasi produk)
-- Sumber data: ap-simpel.pertanian.go.id (Kementerian Pertanian RI) - Daftar Pestisida Terdaftar
-- Semua tabel aplikasi TANIKU disimpan di schema Postgres terpisah bernama "taniku"
-- (bukan "public"), supaya rapi terpisah dari schema bawaan Supabase (auth, storage, dll).
--
-- Jalankan file ini di Supabase SQL Editor SEBELUM import CSV.

create schema if not exists taniku;

create table if not exists taniku.meta (
  key text primary key,
  value text
);

create table if not exists taniku.komoditas (
  id integer primary key,
  nama text not null
);

create table if not exists taniku.bahan_aktif (
  id integer primary key,
  nama text not null
);

create table if not exists taniku.opt (
  id integer primary key,
  nama_umum text,
  nama_latin text
);

create table if not exists taniku.produk (
  id integer primary key,
  nama text not null,
  perusahaan text,
  jenis_pestisida text,
  no_registrasi text,
  tgl_terbit date,
  tgl_berakhir date
);

create table if not exists taniku.produk_bahan_aktif (
  produk_id integer not null references taniku.produk(id),
  bahan_aktif_id integer not null references taniku.bahan_aktif(id),
  kadar text,
  satuan text
);

create table if not exists taniku.aplikasi (
  id integer primary key,
  produk_id integer not null references taniku.produk(id),
  komoditas_id integer not null references taniku.komoditas(id),
  opt_id integer not null references taniku.opt(id),
  dosis text,
  satuan_dosis text
);

create index if not exists idx_aplikasi_kom_opt on taniku.aplikasi(komoditas_id, opt_id);
create index if not exists idx_aplikasi_produk on taniku.aplikasi(produk_id);
create index if not exists idx_pba_produk on taniku.produk_bahan_aktif(produk_id);
create index if not exists idx_pba_bahan on taniku.produk_bahan_aktif(bahan_aktif_id);
create index if not exists idx_komoditas_nama on taniku.komoditas(lower(nama));
create index if not exists idx_opt_umum on taniku.opt(lower(nama_umum));
create index if not exists idx_opt_latin on taniku.opt(lower(nama_latin));
create index if not exists idx_produk_berakhir on taniku.produk(tgl_berakhir);

-- Trigram search (biar pencarian "wereng coklat" toleran typo / substring) --
create extension if not exists pg_trgm;
create index if not exists idx_komoditas_trgm on taniku.komoditas using gin (nama gin_trgm_ops);
create index if not exists idx_opt_umum_trgm on taniku.opt using gin (nama_umum gin_trgm_ops);
create index if not exists idx_opt_latin_trgm on taniku.opt using gin (nama_latin gin_trgm_ops);

-- Fungsi RPC untuk query utama fitur Kendali OPT:
-- input: nama komoditas (partial) + nama OPT (umum/latin, partial)
-- output: bahan aktif terdaftar + top-N produk (registrasi berlaku, terbaru dulu)
create or replace function taniku.kendali_opt_cari(p_komoditas text, p_opt text, p_top_n int default 5)
returns table (
  jenis text,
  nama text,
  detail text,
  jumlah_produk bigint
) language sql stable as $$
  with kom as (
    select id from taniku.komoditas where nama ilike '%' || p_komoditas || '%'
  ),
  o as (
    select id from taniku.opt where nama_umum ilike '%' || p_opt || '%' or nama_latin ilike '%' || p_opt || '%'
  ),
  apl as (
    select a.* from taniku.aplikasi a
    where a.komoditas_id in (select id from kom) and a.opt_id in (select id from o)
  ),
  bahan as (
    select ba.nama, count(distinct pba.produk_id) as jml
    from taniku.produk_bahan_aktif pba
    join taniku.bahan_aktif ba on ba.id = pba.bahan_aktif_id
    where pba.produk_id in (select produk_id from apl)
    group by ba.nama
    order by jml desc
  ),
  produk_top as (
    select p.nama, p.perusahaan, p.jenis_pestisida, p.tgl_berakhir,
           (p.tgl_berakhir >= current_date) as berlaku
    from taniku.produk p
    where p.id in (select produk_id from apl)
    order by berlaku desc, p.tgl_terbit desc
    limit p_top_n
  )
  select 'bahan_aktif', nama, jml || ' produk', jml from bahan
  union all
  select 'produk_rekomendasi', nama, perusahaan || ' | ' || jenis_pestisida ||
         ' | s.d. ' || tgl_berakhir || case when berlaku then ' (berlaku)' else ' (kedaluwarsa)' end,
         null::bigint
  from produk_top;
$$;

-- Data di tabel-tabel ini publik (registri pestisida Kementan, bukan data
-- per-user), jadi RLS tetap diaktifkan (praktik yang disarankan Supabase),
-- tapi dengan policy baca-untuk-semua -- bukan dimatikan begitu saja.
alter table taniku.meta enable row level security;
alter table taniku.komoditas enable row level security;
alter table taniku.bahan_aktif enable row level security;
alter table taniku.opt enable row level security;
alter table taniku.produk enable row level security;
alter table taniku.produk_bahan_aktif enable row level security;
alter table taniku.aplikasi enable row level security;

create policy "public_read" on taniku.meta for select using (true);
create policy "public_read" on taniku.komoditas for select using (true);
create policy "public_read" on taniku.bahan_aktif for select using (true);
create policy "public_read" on taniku.opt for select using (true);
create policy "public_read" on taniku.produk for select using (true);
create policy "public_read" on taniku.produk_bahan_aktif for select using (true);
create policy "public_read" on taniku.aplikasi for select using (true);

-- Supabase API (PostgREST) secara default cuma expose schema "public".
-- Karena kita pakai schema "taniku", tabel & fungsi di atas perlu dibuka aksesnya:
--   1. Di Dashboard: Project Settings > Data API > Exposed schemas -> tambahkan "taniku".
--   2. Jalankan grant di bawah supaya role anon/authenticated bisa baca datanya.
grant usage on schema taniku to anon, authenticated, service_role;

grant select on all tables in schema taniku to anon, authenticated;
alter default privileges in schema taniku grant select on tables to anon, authenticated;

-- service_role dipakai admin script/backend (mis. bikin akun + insert profile),
-- butuh akses penuh, bukan cuma select.
grant all on all tables in schema taniku to service_role;
alter default privileges in schema taniku grant all on tables to service_role;

grant execute on all functions in schema taniku to anon, authenticated, service_role;
alter default privileges in schema taniku grant execute on functions to anon, authenticated, service_role;

-- Pemakaian dari client (lewat PostgREST RPC, schema taniku harus di-exposed dulu):
-- select * from taniku.kendali_opt_cari('padi', 'wereng coklat');
