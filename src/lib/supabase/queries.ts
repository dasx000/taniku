import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "petani";

export type CurrentProfile = {
  id: string;
  email: string | undefined;
  full_name: string;
  role: UserRole;
  phone: string | null;
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
    .select("full_name, role, phone")
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
