# Paket data "Kendali OPT" — Aplikasi Penyuluhan Way Kanan

Sumber: **ap-simpel.pertanian.go.id** (Kementerian Pertanian RI) — Daftar Pestisida Terdaftar.
Tanggal tarik data (snapshot): **2026-09-13**
Jumlah produk pestisida: **7.724**

## Isi paket

- `schema.sql` — skema tabel Postgres + index + fungsi RPC `kendali_opt_cari(komoditas, opt, top_n)` siap pakai di Supabase.
- `komoditas.csv`, `bahan_aktif.csv`, `opt.csv`, `produk.csv`, `produk_bahan_aktif.csv`, `aplikasi.csv`, `meta.csv` — data hasil normalisasi (lihat skema di bawah).
- (di luar paket ini) `kendali_opt.sqlite` — database SQLite yang sama, untuk uji coba lokal cepat tanpa Supabase.

## Cara import ke Supabase

1. Buat project Supabase (gratis).
2. Buka **SQL Editor** → jalankan isi `schema.sql` (ini juga akan mengaktifkan extension `pg_trgm` untuk pencarian toleran-typo).
3. Buka **Table Editor** → pilih tiap tabel → **Insert → Import data from CSV** → upload file csv yang namanya sama dengan nama tabel. Urutan import (penting, karena ada foreign key):
   1. `meta.csv`
   2. `komoditas.csv`
   3. `bahan_aktif.csv`
   4. `opt.csv`
   5. `produk.csv`
   6. `produk_bahan_aktif.csv`
   7. `aplikasi.csv`
4. Selesai. Uji query:
   ```sql
   select * from kendali_opt_cari('padi', 'wereng coklat');
   ```

Alternatif via `psql`/`supabase db`:
```bash
psql "$SUPABASE_DB_URL" -f schema.sql
psql "$SUPABASE_DB_URL" -c "\copy komoditas from 'komoditas.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy bahan_aktif from 'bahan_aktif.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy opt from 'opt.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy produk from 'produk.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy produk_bahan_aktif from 'produk_bahan_aktif.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy aplikasi from 'aplikasi.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy meta from 'meta.csv' csv header"
```

## Skema data

| Tabel | Isi |
|---|---|
| `komoditas` | 736 nama komoditas (padi, cabai, jagung, dst — sudah digabung dari 875 varian ejaan/kapitalisasi) |
| `bahan_aktif` | 1.306 bahan aktif unik (digabung dari 2.111 varian ejaan/kapitalisasi/glos EN-ID) |
| `opt` | 2.125 OPT (hama/penyakit/gulma), tiap baris punya `nama_umum` (mis. "Wereng coklat") dan `nama_latin` (mis. "Nilaparvata lugens") |
| `produk` | 7.724 produk pestisida terdaftar: nama, perusahaan, jenis, no. registrasi, tanggal terbit & berakhir izin |
| `produk_bahan_aktif` | relasi produk ↔ bahan aktif + kadar/satuan (mis. "480 g/l") |
| `aplikasi` | 22.970 baris "anjuran pemakaian": produk × komoditas × OPT × dosis — **ini tabel inti untuk query fitur Kendali OPT** |
| `meta` | metadata snapshot (tanggal tarik, sumber, catatan) |

## Query inti fitur "Kendali OPT"

**Input:** komoditas + nama OPT (hama/penyakit/gulma)
**Output:** daftar bahan aktif terdaftar untuk kombinasi itu + (opsional) top-5 rekomendasi produk

Contoh (lihat juga `kendali_opt_cari` di `schema.sql`, atau `query_kendali_opt.py` untuk versi SQLite):

```sql
select ba.nama, count(distinct pba.produk_id) as jml_produk
from aplikasi a
join produk_bahan_aktif pba on pba.produk_id = a.produk_id
join bahan_aktif ba on ba.id = pba.bahan_aktif_id
join komoditas k on k.id = a.komoditas_id
join opt o on o.id = a.opt_id
where k.nama ilike '%padi%' and (o.nama_umum ilike '%wereng coklat%' or o.nama_latin ilike '%wereng coklat%')
group by ba.nama
order by jml_produk desc;
```

## PENTING: soal "update tiap tahun"

Ditanyakan: apakah database sumber (Kementan) punya field "terakhir diupdate" yang bisa dipakai untuk cek kapan harus tarik ulang?

**Tidak ada.** Sumbernya tidak menyediakan satu timestamp global "last updated". Yang ada hanya per-produk: `tgl_terbit` (tanggal izin edar terbit) dan `tgl_berakhir` (tanggal izin edar habis) — jadi produk baru bisa muncul, produk lama bisa habis izin, kapan saja, tanpa ada satu angka yang menandai "database berubah pada tanggal X".

Solusinya (sudah diterapkan di paket ini): kita buat versi sendiri. Kolom `tanggal_tarik_data` di tabel `meta` mencatat kapan snapshot ini ditarik (2026-09-13). Skema refresh yang disarankan:

1. Setahun sekali (atau kapan pun mau), ulangi proses tarik data dari ap-simpel.pertanian.go.id.
2. Timpa/replace seluruh isi tabel dengan data baru, lalu update `meta.tanggal_tarik_data` ke tanggal tarik yang baru.
3. Opsional: simpan snapshot lama sebagai arsip (mis. tabel `aplikasi_arsip_2026`) kalau suatu saat mau bandingkan "produk apa yang hilang/baru" dari tahun ke tahun — tapi ini fitur tambahan, tidak wajib untuk v1.

Karena ukurannya kecil (~2.8 MB / 500 MB kuota gratis Supabase), proses tarik-ulang-dan-timpa ini murah dan aman dilakukan kapan saja.
