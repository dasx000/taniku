import Link from "next/link";
import { Pencil, Phone } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { ROLE_LABEL, getInitials } from "@/lib/profile";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfilPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-6 pt-6">
      <header className="px-6">
        <h1 className="font-heading text-xl font-bold text-primary">Profil</h1>
      </header>

      <section className="mx-6 flex flex-col items-center gap-1 rounded-card bg-card p-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-lg font-bold text-forest">
          {profile ? getInitials(profile.full_name) : "-"}
        </span>
        <p className="mt-2 font-heading text-base font-bold text-primary">
          {profile?.full_name ?? "-"}
        </p>
        <p className="text-sm font-medium text-forest">
          {profile ? ROLE_LABEL[profile.role] : "-"}
        </p>

        <div className="mt-1 flex flex-col items-center gap-0.5 text-xs text-secondary">
          <span>{profile?.email}</span>
          {profile?.phone ? (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" strokeWidth={2} />
              {profile.phone}
            </span>
          ) : null}
        </div>

        <Link
          href="/profil/edit"
          className="mt-4 flex h-10 items-center gap-2 rounded-button bg-forest px-5 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
          Edit Profil
        </Link>
      </section>

      <section className="mx-6 flex justify-center">
        <LogoutButton />
      </section>

      <p className="px-6 text-center text-[11px] text-secondary">TaniKu v1.0.0</p>
    </div>
  );
}
