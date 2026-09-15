# Setup database Supabase — TANIKU

Semua tabel aplikasi ini disimpan di Postgres schema **`taniku`** (bukan `public`),
supaya terpisah rapi dari schema bawaan Supabase.

## Langkah setup

1. Buat project Supabase (kalau belum ada).
2. Buka **SQL Editor** → jalankan seluruh isi [`schema.sql`](./schema.sql).
   Ini akan:
   - Membuat schema `taniku` beserta tabel, index, dan fungsi RPC `kendali_opt_cari`.
   - Mengaktifkan extension `pg_trgm` (pencarian toleran-typo).
   - Memberi grant akses baca (`select`) & eksekusi fungsi ke role `anon`/`authenticated`.
3. **Expose schema `taniku` ke API** (wajib, karena default Supabase cuma expose `public`):
   - Buka **Project Settings → Data API → Exposed schemas**.
   - Tambahkan `taniku` ke daftar, lalu simpan.
4. Import data CSV dari folder [`data/`](./data) lewat **Table Editor → pilih tabel → Insert → Import data from CSV**.
   Urutan import penting karena ada foreign key:
   1. `meta.csv`
   2. `komoditas.csv`
   3. `bahan_aktif.csv`
   4. `opt.csv`
   5. `produk.csv`
   6. `produk_bahan_aktif.csv`
   7. `aplikasi.csv`

   Pastikan saat import kamu memilih tabel yang berada di schema **`taniku`** (bukan `public`).

5. Tes query lewat SQL Editor:
   ```sql
   select * from taniku.kendali_opt_cari('padi', 'wereng coklat');
   ```
6. Jalankan [`auth.sql`](./auth.sql) di SQL Editor. Ini membuat tabel `taniku.profiles`
   (role `admin`/`petani`, nama, No HP) + fungsi RPC `resolve_login_email` yang
   dipakai halaman login untuk resolve No HP → email.
7. Jalankan [`opt-search.sql`](./opt-search.sql) di SQL Editor. Ini membuat fungsi RPC
   untuk fitur Hama/Gulma/Penyakit (satu mesin pencarian, difilter kategori
   `jenis_pestisida`): `list_komoditas_by_kategori`, `list_opt_by_komoditas`,
   `kendali_opt_bahan_aktif`, `kendali_opt_produk_top`.
8. Jalankan [`lahan.sql`](./lahan.sql) di SQL Editor. Ini membuat tabel
   `taniku.lahan` (data lahan pribadi per-user untuk halaman "Lahan Saya"),
   dengan RLS: tiap user cuma bisa baca/tulis baris miliknya sendiri.
9. Jalankan [`tanaman.sql`](./tanaman.sql) di SQL Editor. Ini menambah kolom
   `tanggal_tanam`/`status` di `taniku.lahan` + tabel `taniku.lahan_tahapan`
   (5 tahap budidaya per lahan) untuk halaman "Tanaman Saya".
10. Jalankan [`profile-edit.sql`](./profile-edit.sql) di SQL Editor. Ini
    menambah policy RLS `profiles_update_own` + grant kolom `full_name`/`phone`
    supaya user bisa edit profilnya sendiri lewat halaman "Edit Profil"
    (kolom `role`/`id` sengaja tidak di-grant).
11. Jalankan [`wilayah.sql`](./wilayah.sql) di SQL Editor. Ini membuat tabel
    referensi **`public.wilayah`** (Provinsi/Kabupaten/Kecamatan/Desa sesuai
    Kepmendagri, dipakai buat form domisili + kode adm4 untuk API cuaca BMKG)
    dan kolom domisili (`provinsi`/`kabupaten`/`kecamatan`/`desa`/`kode_wilayah`)
    di `taniku.profiles`. Sengaja di schema `public` (bukan `taniku`) karena ini
    data referensi umum lintas-aplikasi -- app lain yang connect ke project
    Supabase yang sama bisa langsung pakai tanpa bikin tabel sendiri; `public`
    juga sudah otomatis ter-expose ke Data API (tidak perlu langkah 3 lagi).
    Setelah itu import [`data/wilayah.csv`](./data/wilayah.csv) (~91 ribu baris)
    ke tabel `public.wilayah` -- lewat `psql \copy` (lihat bagian alternatif di
    bawah) karena terlalu besar untuk Table Editor.

## Akun dummy yang sudah tersedia

Akun testing (1 per role) sudah dibuat di project ini, siap dipakai login:

| Role | Login pakai | Password |
|---|---|---|
| Petani | `petani@taniku.test` atau `081234567890` | `Petani123!` |
| Admin | `admin@taniku.test` | `Admin123!` |

Ganti/hapus akun-akun ini sebelum production. Untuk bikin akun baru manual, ikuti langkah di bawah.

## Membuat akun testing (login, register belum ada)

Tahap ini baru fitur **login**, belum ada halaman daftar akun — jadi akun dibuat manual dulu:

1. **Dashboard → Authentication → Users → Add user.** Isi email + password, centang
   "Auto Confirm User" (supaya tidak perlu verifikasi email dulu).
2. Copy `id` (UUID) user yang baru dibuat.
3. **SQL Editor**, insert profilnya:
   ```sql
   insert into taniku.profiles (id, role, full_name, phone)
   values (
     '00000000-0000-0000-0000-000000000000', -- ganti dengan id dari step 2
     'petani',            -- 'admin' | 'petani'
     'Budi Santoso',
     '081234567890'       -- opsional, buat login pakai No HP
   );
   ```
4. Login di app pakai email yang didaftarkan, ATAU No HP yang diisi di atas — sama-sama pakai password yang di-set di step 1.

## Alternatif via `psql` / `supabase db`

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -c "\copy taniku.meta from 'supabase/data/meta.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy taniku.komoditas from 'supabase/data/komoditas.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy taniku.bahan_aktif from 'supabase/data/bahan_aktif.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy taniku.opt from 'supabase/data/opt.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy taniku.produk from 'supabase/data/produk.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy taniku.produk_bahan_aktif from 'supabase/data/produk_bahan_aktif.csv' csv header"
psql "$SUPABASE_DB_URL" -c "\copy taniku.aplikasi from 'supabase/data/aplikasi.csv' csv header"
psql "$SUPABASE_DB_URL" -f supabase/auth.sql
psql "$SUPABASE_DB_URL" -f supabase/wilayah.sql
psql "$SUPABASE_DB_URL" -c "\copy public.wilayah from 'supabase/data/wilayah.csv' csv header"
```

## Memanggil RPC dari kode Next.js

Karena fungsi & tabel ada di schema `taniku`, client Supabase JS perlu di-set
`db.schema` ke `"taniku"` (lihat `src/lib/supabase/client.ts` / `server.ts`),
atau panggil lewat client schema `public` biasa dengan query eksplisit
`schema('taniku')` per-request — pilih salah satu pola dan konsisten.

## Konteks data

- Sumber: **ap-simpel.pertanian.go.id** (Kementerian Pertanian RI) — Daftar Pestisida Terdaftar.
- Snapshot ditarik: **2026-09-13**, ~7.724 produk pestisida.
- Tidak ada field "last updated" global dari sumbernya — refresh data dilakukan
  dengan menarik ulang & replace seluruh isi tabel, lalu update `taniku.meta.tanggal_tarik_data`.
- Detail lengkap struktur data ada di `reference/kendali-opt-supabase-package/README.md`.
