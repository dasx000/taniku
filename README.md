# Taniku

Aplikasi web penyuluhan pertanian, desain mobile-first.

Stack: [Next.js](https://nextjs.org) (App Router) + [Tailwind CSS](https://tailwindcss.com) + [Supabase](https://supabase.com), deploy ke [Vercel](https://vercel.com).

## Menjalankan secara lokal

1. Salin `.env.example` ke `.env.local` lalu isi kredensial Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
2. Install dependency & jalankan dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Buka [http://localhost:3000](http://localhost:3000).

## Struktur

- `src/app` — routes (App Router).
- `src/lib/supabase` — helper client Supabase (browser, server, middleware session refresh).
- `middleware.ts` — refresh session auth Supabase di tiap request.
- `supabase/` — schema database (Postgres schema `taniku`) + data awal (CSV) + panduan setup. Lihat [`supabase/README.md`](./supabase/README.md).
- `reference/` — materi referensi (draft desain, data mentah) yang bukan bagian dari kode aplikasi.

## Database

Semua tabel aplikasi disimpan di schema Postgres **`taniku`** (bukan `public`). Setup lengkap ada di [`supabase/README.md`](./supabase/README.md).

## Deploy

Deploy ke [Vercel](https://vercel.com/new), lalu set environment variables yang sama seperti `.env.local` di project settings Vercel.
