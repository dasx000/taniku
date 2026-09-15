"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex h-11 items-center gap-2 rounded-button border border-black/10 px-4 text-sm font-semibold text-danger disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
