import { createClient } from "@/lib/supabase/client";

export type OptKategori = "hama" | "gulma" | "penyakit";

export type KomoditasOption = { id: number; nama: string };

export type OptOption = {
  id: number;
  nama_umum: string | null;
  nama_latin: string | null;
};

export type BahanAktifResult = { nama: string; jumlah_produk: number };

export type ProdukTopResult = {
  produk_id: number;
  nama: string;
  perusahaan: string | null;
  jenis_pestisida: string;
  dosis: string | null;
  bahan_aktif: string | null;
  tgl_berakhir: string | null;
  berlaku: boolean;
};

export async function fetchKomoditasByKategori(
  kategori: OptKategori,
  query: string,
  limit = 30,
): Promise<KomoditasOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_komoditas_by_kategori", {
    p_kategori: kategori,
    p_query: query,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as KomoditasOption[];
}

export async function fetchOptByKomoditas(
  komoditasId: number,
  kategori: OptKategori,
  query: string,
): Promise<OptOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_opt_by_komoditas", {
    p_komoditas_id: komoditasId,
    p_kategori: kategori,
    p_query: query,
    p_limit: 50,
  });
  if (error) throw error;
  return (data ?? []) as OptOption[];
}

export async function fetchBahanAktif(
  komoditasId: number,
  optId: number,
  kategori: OptKategori,
): Promise<BahanAktifResult[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("kendali_opt_bahan_aktif", {
    p_komoditas_id: komoditasId,
    p_opt_id: optId,
    p_kategori: kategori,
  });
  if (error) throw error;
  return (data ?? []) as BahanAktifResult[];
}

export async function fetchProdukTop(
  komoditasId: number,
  optId: number,
  kategori: OptKategori,
): Promise<ProdukTopResult[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("kendali_opt_produk_top", {
    p_komoditas_id: komoditasId,
    p_opt_id: optId,
    p_kategori: kategori,
    p_top_n: 5,
  });
  if (error) throw error;
  return (data ?? []) as ProdukTopResult[];
}
