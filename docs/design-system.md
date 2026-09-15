# TaniKu — Design System & Direction

Brief ini adalah acuan visual/UX untuk seluruh halaman TaniKu. Semua implementasi UI (Tailwind theme, komponen, halaman baru) harus konsisten dengan dokumen ini. Kalau ada detail yang belum ditentukan di brief, ambil keputusan UX terbaik tanpa mengubah arah desain di bawah.

## Konteks produk

**TaniKu** — aplikasi digital pertanian Indonesia untuk dua role pengguna:
1. Petani
2. Admin

Tujuan: satu aplikasi untuk semua kebutuhan info & alat bantu pertanian — kalkulator benih, kalkulator pupuk, cuaca, hama, gulma, penyakit tanaman, AUT (Alat dan Mesin Pertanian/Areal Usaha Tani — cek istilah dengan user saat fitur ini dibangun), jadwal tanam, informasi budidaya, monitoring pertanian.

Brand feel: **"Teman digital petani dalam satu genggaman."**

## Design direction: "Modern Agricultural / Soft Nature UI"

Karakter visual:
- Modern, bersih, profesional, ramah, mudah dipahami petani
- Bukan corporate yang kaku, bukan marketplace
- Tidak ramai, tidak terlalu didominasi hijau di semua elemen
- Nuansa Indonesia & pertanian tetap terasa

**Larangan eksplisit:**
- Jangan desain seperti marketplace (e-commerce card grid, badge diskon, dsb.)
- Jangan pakai hijau di hampir semua elemen — gunakan warna semantik/pastel untuk variasi
- Jangan semua card berukuran sama kalau hierarchy butuh variasi ukuran
- Jangan gradient berlebihan
- Jangan glassmorphism berlebihan
- Jangan shadow berat — soft/subtle saja
- Jangan card terlalu dekoratif

## Color system

| Token | Hex | Peran |
|---|---|---|
| Primary Forest Green | `#16834B` | Aksi utama, brand accent |
| Secondary Leaf Green | `#65B84F` | Aksen sekunder, highlight |
| Background Warm White | `#F7FAF6` | Background halaman |
| Card White | `#FFFFFF` | Background card/surface |
| Primary Text | `#17231C` | Teks utama |
| Secondary Text | `#6B756E` | Teks sekunder/caption |

Semantic colors:

| Token | Hex | Peran |
|---|---|---|
| Weather Blue | `#5BA8D6` | Fitur cuaca |
| Warning Orange | `#F2A93B` | Peringatan |
| Danger Red | `#E7655A` | Bahaya/error (hama, penyakit kritis) |
| Info Purple | `#8A75C7` | Informasi netral |

Aturan pakai: warna semantik dipakai untuk membedakan kategori fitur (mis. cuaca = biru, hama/penyakit = merah, info budidaya = ungu) supaya dashboard tidak didominasi hijau meskipun ini "aplikasi pertanian".

## Typography

- Heading: **Plus Jakarta Sans**
- Body/UI: **Inter**
- Harus jelas & nyaman dibaca di layar smartphone (ukuran, line-height, kontras cukup).

## UI elements

- Card radius: 16–20px
- Button radius: 12–14px
- Input radius: 12px
- Shadow: soft & subtle saja, tidak berat
- Whitespace cukup, border tipis bila perlu
- Icon: style soft-rounded / duotone, ditempatkan dalam container lingkaran atau rounded-square berwarna pastel
- Ilustrasi pertanian dipakai secara selektif, tidak berlebihan

## Layout

- Mobile-first, referensi ukuran desain: **390 × 844**
- Perhatikan safe area (notch, home indicator)
- Spacing konsisten (pakai skala, bukan angka acak)
- Dashboard: grid fitur **4 kolom**
- Bottom navigation dipakai di halaman utama
- Touch target minimal **~44px**
- Hierarchy informasi harus sangat jelas (ukuran, warna, posisi membedakan prioritas)

## Navigation

Bottom navigation utama (icon + label):
1. Beranda
2. Informasi
3. Notifikasi
4. Profil

## Prinsip konsistensi

Semua halaman harus terasa sebagai **satu aplikasi yang sama** — pertahankan design system ini (warna, tipografi, radius, icon style, spacing, visual hierarchy) di setiap halaman baru yang dibangun.
