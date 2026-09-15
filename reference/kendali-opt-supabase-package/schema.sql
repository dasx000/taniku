-- Skema untuk fitur "Kendali OPT" (komoditas + OPT -> bahan aktif + rekomendasi produk)
-- Sumber data: ap-simpel.pertanian.go.id (Kementerian Pertanian RI) - Daftar Pestisida Terdaftar
-- Jalankan di Supabase SQL Editor SEBELUM import CSV.

create table if not exists meta (
  key text primary key,
  value text
);

create table if not exists komoditas (
  id integer primary key,
  nama text not null
);

create table if not exists bahan_aktif (
  id integer primary key,
  nama text not null
);

create table if not exists opt (
  id integer primary key,
  nama_umum text,
  nama_latin text
);

create table if not exists produk (
  id integer primary key,
  nama text not null,
  perusahaan text,
  jenis_pestisida text,
  no_registrasi text,
  tgl_terbit date,
  tgl_berakhir date
);

create table if not exists produk_bahan_aktif (
  produk_id integer not null references produk(id),
  bahan_aktif_id integer not null references bahan_aktif(id),
  kadar text,
  satuan text
);

create table if not exists aplikasi (
  id integer primary key,
  produk_id integer not null references produk(id),
  komoditas_id integer not null references komoditas(id),
  opt_id integer not null references opt(id),
  dosis text,
  satuan_dosis text
);

create index if not exists idx_aplikasi_kom_opt on aplikasi(komoditas_id, opt_id);
create index if not exists idx_aplikasi_produk on aplikasi(produk_id);
create index if not exists idx_pba_produk on produk_bahan_aktif(produk_id);
create index if not exists idx_pba_bahan on produk_bahan_aktif(bahan_aktif_id);
create index if not exists idx_komoditas_nama on komoditas(lower(nama));
create index if not exists idx_opt_umum on opt(lower(nama_umum));
create index if not exists idx_opt_latin on opt(lower(nama_latin));
create index if not exists idx_produk_berakhir on produk(tgl_berakhir);

-- Trigram search (biar pencarian "wereng coklat" toleran typo / substring) --
-- Aktifkan dulu extension pg_trgm di Supabase: Database > Extensions > pg_trgm
create extension if not exists pg_trgm;
create index if not exists idx_komoditas_trgm on komoditas using gin (nama gin_trgm_ops);
create index if not exists idx_opt_umum_trgm on opt using gin (nama_umum gin_trgm_ops);
create index if not exists idx_opt_latin_trgm on opt using gin (nama_latin gin_trgm_ops);

-- Contoh fungsi RPC untuk query utama fitur Kendali OPT:
-- input: nama komoditas (partial) + nama OPT (umum/latin, partial)
-- output: bahan aktif terdaftar + top-N produk (registrasi berlaku, terbaru dulu)
create or replace function kendali_opt_cari(p_komoditas text, p_opt text, p_top_n int default 5)
returns table (
  jenis text,
  nama text,
  detail text,
  jumlah_produk bigint
) language sql stable as $$
  with kom as (
    select id from komoditas where nama ilike '%' || p_komoditas || '%'
  ),
  o as (
    select id from opt where nama_umum ilike '%' || p_opt || '%' or nama_latin ilike '%' || p_opt || '%'
  ),
  apl as (
    select a.* from aplikasi a
    where a.komoditas_id in (select id from kom) and a.opt_id in (select id from o)
  ),
  bahan as (
    select ba.nama, count(distinct pba.produk_id) as jml
    from produk_bahan_aktif pba
    join bahan_aktif ba on ba.id = pba.bahan_aktif_id
    where pba.produk_id in (select produk_id from apl)
    group by ba.nama
    order by jml desc
  ),
  produk_top as (
    select p.nama, p.perusahaan, p.jenis_pestisida, p.tgl_berakhir,
           (p.tgl_berakhir >= current_date) as berlaku
    from produk p
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

-- Pemakaian:
-- select * from kendali_opt_cari('padi', 'wereng coklat');
