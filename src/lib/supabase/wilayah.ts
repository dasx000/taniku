import { createClient } from "@/lib/supabase/client";

export type WilayahOption = { kode: string; nama: string };

// Tabel referensi taniku.wilayah sengaja ada di schema "public" (data
// referensi lintas-aplikasi, bukan spesifik TaniKu) -- client default-nya
// "taniku", jadi query ke sini WAJIB .schema("public") eksplisit.

export async function getProvinsiList(): Promise<WilayahOption[]> {
  const supabase = createClient();
  const { data } = await supabase
    .schema("public")
    .from("wilayah")
    .select("kode, nama")
    .is("induk_kode", null)
    .order("nama", { ascending: true });

  return data ?? [];
}

export async function getWilayahChildren(indukKode: string): Promise<WilayahOption[]> {
  const supabase = createClient();
  const { data } = await supabase
    .schema("public")
    .from("wilayah")
    .select("kode, nama")
    .eq("induk_kode", indukKode)
    .order("nama", { ascending: true });

  return data ?? [];
}
