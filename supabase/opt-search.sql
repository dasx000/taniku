-- Mesin pencarian "Kendali OPT" yang dipakai bersama oleh 3 pintu masuk di
-- Beranda: Hama, Gulma, Penyakit. Beda pintu = beda kategori jenis_pestisida,
-- alur & tabelnya sama persis.
--
-- Alur: 1) pilih komoditas (per kategori)  2) pilih OPT (per komoditas+kategori)
--       3) lihat bahan aktif + (opsional/collapsible) top-N produk
--
-- Jalankan SETELAH schema.sql (butuh tabel komoditas/opt/produk/aplikasi/dst).

-- Kategori (Hama/Gulma/Penyakit) tidak ada langsung di tabel opt -- nempel di
-- kolom jenis_pestisida pada tabel produk. Fungsi ini pusat mapping-nya,
-- dipakai ulang oleh semua fungsi di bawah supaya konsisten.
create or replace function taniku.jenis_pestisida_for_kategori(p_kategori text)
returns text[]
language sql
immutable
as $$
  select case lower(p_kategori)
    when 'hama' then array['Insektisida', 'Akarisida', 'Moluskisida', 'Nematisida', 'Rodentisida']
    when 'penyakit' then array['Fungisida', 'Bakterisida']
    when 'gulma' then array['Herbisida']
    else array[]::text[]
  end;
$$;

-- Step 1: daftar komoditas yang punya data terdaftar untuk kategori ini.
-- p_query kosong -> semua (urut abjad). p_query diisi -> tolerant typo (pg_trgm).
create or replace function taniku.list_komoditas_by_kategori(
  p_kategori text,
  p_query text default '',
  p_limit int default 30
)
returns table (id integer, nama text)
language sql
stable
as $$
  select k.id, k.nama
  from (
    select distinct k.id, k.nama
    from taniku.komoditas k
    join taniku.aplikasi a on a.komoditas_id = k.id
    join taniku.produk p on p.id = a.produk_id
    where p.jenis_pestisida = any(taniku.jenis_pestisida_for_kategori(p_kategori))
      and (
        p_query = ''
        or k.nama ilike '%' || p_query || '%'
        or k.nama % p_query
      )
  ) k
  order by
    case when p_query = '' then 0 else similarity(k.nama, p_query) end desc,
    k.nama
  limit p_limit;
$$;

-- Step 2: daftar OPT yang terdaftar untuk komoditas + kategori terpilih.
-- Bukan freetext bebas -- list ini sudah pasti relevan (ada data aplikasi-nya).
create or replace function taniku.list_opt_by_komoditas(
  p_komoditas_id integer,
  p_kategori text,
  p_query text default '',
  p_limit int default 50
)
returns table (id integer, nama_umum text, nama_latin text)
language sql
stable
as $$
  select o.id, o.nama_umum, o.nama_latin
  from (
    select distinct o.id, o.nama_umum, o.nama_latin
    from taniku.opt o
    join taniku.aplikasi a on a.opt_id = o.id
    join taniku.produk p on p.id = a.produk_id
    where a.komoditas_id = p_komoditas_id
      and p.jenis_pestisida = any(taniku.jenis_pestisida_for_kategori(p_kategori))
      and (
        p_query = ''
        or o.nama_umum ilike '%' || p_query || '%'
        or o.nama_latin ilike '%' || p_query || '%'
        or o.nama_umum % p_query
      )
  ) o
  order by
    case when p_query = '' then 0
      else greatest(similarity(o.nama_umum, p_query), similarity(coalesce(o.nama_latin, ''), p_query))
    end desc,
    o.nama_umum
  limit p_limit;
$$;

-- Step 3a: bahan aktif terdaftar untuk kombinasi komoditas+opt+kategori,
-- diurut dari yang paling banyak dipakai (proxy "paling umum") -- bagian ini
-- yang tampil duluan/utama di layar hasil.
create or replace function taniku.kendali_opt_bahan_aktif(
  p_komoditas_id integer,
  p_opt_id integer,
  p_kategori text
)
returns table (nama text, jumlah_produk bigint)
language sql
stable
as $$
  with apl as (
    select a.produk_id
    from taniku.aplikasi a
    join taniku.produk p on p.id = a.produk_id
    where a.komoditas_id = p_komoditas_id
      and a.opt_id = p_opt_id
      and p.jenis_pestisida = any(taniku.jenis_pestisida_for_kategori(p_kategori))
  )
  select ba.nama, count(distinct pba.produk_id) as jumlah_produk
  from taniku.produk_bahan_aktif pba
  join taniku.bahan_aktif ba on ba.id = pba.bahan_aktif_id
  where pba.produk_id in (select produk_id from apl)
  group by ba.nama
  order by jumlah_produk desc, ba.nama;
$$;

-- Step 3b: top-N produk (registrasi masih berlaku dulu, lalu terbaru terbit --
-- PROXY, bukan data penjualan/efektivitas asli). Dipanggil terpisah supaya
-- bisa di-lazy-load pas bagian "Lihat rekomendasi produk" dibuka di UI.
create or replace function taniku.kendali_opt_produk_top(
  p_komoditas_id integer,
  p_opt_id integer,
  p_kategori text,
  p_top_n integer default 5
)
returns table (
  produk_id integer,
  nama text,
  perusahaan text,
  jenis_pestisida text,
  dosis text,
  bahan_aktif text,
  tgl_berakhir date,
  berlaku boolean
)
language sql
stable
as $$
  with apl as (
    select
      a.produk_id,
      string_agg(distinct trim(a.dosis || ' ' || coalesce(a.satuan_dosis, '')), ' / ') as dosis_info
    from taniku.aplikasi a
    join taniku.produk p on p.id = a.produk_id
    where a.komoditas_id = p_komoditas_id
      and a.opt_id = p_opt_id
      and p.jenis_pestisida = any(taniku.jenis_pestisida_for_kategori(p_kategori))
    group by a.produk_id
  ),
  produk_top as (
    select
      p.id, p.nama, p.perusahaan, p.jenis_pestisida, p.tgl_berakhir, p.tgl_terbit,
      (p.tgl_berakhir >= current_date) as berlaku,
      apl.dosis_info
    from taniku.produk p
    join apl on apl.produk_id = p.id
    order by berlaku desc, p.tgl_terbit desc
    limit p_top_n
  )
  select
    pt.id,
    pt.nama,
    pt.perusahaan,
    pt.jenis_pestisida,
    pt.dosis_info,
    string_agg(ba.nama, ', ' order by ba.nama),
    pt.tgl_berakhir,
    pt.berlaku
  from produk_top pt
  left join taniku.produk_bahan_aktif pba on pba.produk_id = pt.id
  left join taniku.bahan_aktif ba on ba.id = pba.bahan_aktif_id
  group by pt.id, pt.nama, pt.perusahaan, pt.jenis_pestisida, pt.dosis_info, pt.tgl_berakhir, pt.berlaku, pt.tgl_terbit
  order by pt.berlaku desc, pt.tgl_terbit desc nulls last;
$$;

grant execute on function taniku.jenis_pestisida_for_kategori(text) to anon, authenticated, service_role;
grant execute on function taniku.list_komoditas_by_kategori(text, text, int) to anon, authenticated, service_role;
grant execute on function taniku.list_opt_by_komoditas(integer, text, text, int) to anon, authenticated, service_role;
grant execute on function taniku.kendali_opt_bahan_aktif(integer, integer, text) to anon, authenticated, service_role;
grant execute on function taniku.kendali_opt_produk_top(integer, integer, text, integer) to anon, authenticated, service_role;
