import { User } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { ROLE_LABEL } from "@/lib/profile";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfilPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-6 pt-6">
      <header className="px-6">
        <h1 className="font-heading text-xl font-bold text-primary">Profil</h1>
      </header>

      <section className="mx-6 flex flex-col items-center gap-2 rounded-card bg-card p-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
          <User className="h-7 w-7 text-forest" strokeWidth={2} />
        </span>
        <p className="font-heading text-base font-bold text-primary">
          {profile?.full_name ?? "-"}
        </p>
        <p className="text-sm font-medium text-forest">
          {profile ? ROLE_LABEL[profile.role] : "-"}
        </p>
        <p className="text-xs text-secondary">{profile?.email}</p>
      </section>

      <section className="mx-6 flex justify-center">
        <LogoutButton />
      </section>
    </div>
  );
}
