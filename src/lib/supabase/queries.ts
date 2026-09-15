import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "petani";

export type CurrentProfile = {
  id: string;
  email: string | undefined;
  full_name: string;
  role: UserRole;
  phone: string | null;
  provinsi: string | null;
  kabupaten: string | null;
  kecamatan: string | null;
  desa: string | null;
  kode_wilayah: string | null;
};

/**
 * Dedupe per-request (React cache()) supaya layout + page yang sama-sama
 * butuh profil user tidak double round-trip ke Supabase.
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, phone, provinsi, kabupaten, kecamatan, desa, kode_wilayah")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { id: user.id, email: user.email, ...profile };
});

export type LahanRow = {
  id: string;
  nama: string;
  luas_ha: number;
  komoditas: string | null;
  lokasi: string | null;
};

export const getMyLahan = cache(async (): Promise<LahanRow[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("lahan")
    .select("id, nama, luas_ha, komoditas, lokasi")
    .order("created_at", { ascending: true });

  return data ?? [];
});

export type LahanStatus = "akan_tanam" | "persiapan" | "dalam_proses" | "panen";
export type TahapanStatus = "selesai" | "berjalan" | "belum_mulai";

export type TahapanRow = {
  id: string;
  urutan: number;
  nama_tahap: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  status: TahapanStatus;
};

export type TanamanRow = {
  id: string;
  nama: string;
  luas_ha: number;
  komoditas: string | null;
  lokasi: string | null;
  tanggal_tanam: string | null;
  status: LahanStatus | null;
  lahan_tahapan: TahapanRow[];
};

// Cakupan "Tanaman Saya" untuk sekarang hanya Padi & Jagung.
const TANAMAN_KOMODITAS = ["Padi", "Jagung"] as const;

export const getMyTanaman = cache(async (): Promise<TanamanRow[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("lahan")
    .select(
      "id, nama, luas_ha, komoditas, lokasi, tanggal_tanam, status, lahan_tahapan(id, urutan, nama_tahap, tanggal_mulai, tanggal_selesai, status)",
    )
    .in("komoditas", TANAMAN_KOMODITAS)
    .order("created_at", { ascending: true })
    .order("urutan", { referencedTable: "lahan_tahapan", ascending: true });

  return (data as TanamanRow[] | null) ?? [];
});
