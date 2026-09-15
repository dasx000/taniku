import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { EditProfilForm } from "@/components/profil/edit-profil-form";

export default async function EditProfilPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <EditProfilForm
      fullName={profile.full_name}
      phone={profile.phone ?? ""}
      provinsi={profile.provinsi}
      kabupaten={profile.kabupaten}
      kecamatan={profile.kecamatan}
      desa={profile.desa}
      kodeWilayah={profile.kode_wilayah}
    />
  );
}
