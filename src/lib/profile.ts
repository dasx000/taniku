import type { UserRole } from "@/lib/supabase/queries";

export const ROLE_LABEL: Record<UserRole, string> = {
  petani: "Petani",
  admin: "Admin",
};

export function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Asumsi WIB sampai ada data lokasi per-user (mis. desa dari data lahan) untuk
// menentukan zona waktu yang tepat.
export function getGreeting(date: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(date),
  );

  if (hour < 11) return "Selamat pagi,";
  if (hour < 15) return "Selamat siang,";
  if (hour < 18) return "Selamat sore,";
  return "Selamat malam,";
}
