import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/beranda");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-heading text-xl font-bold text-primary">Admin Dashboard</p>
      <p className="text-sm text-secondary">
        Halo, {profile.full_name}. Panel admin akan dibangun di tahap berikutnya.
      </p>
      <LogoutButton />
    </main>
  );
}
