import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(profile.role === "admin" ? "/admin" : "/beranda");
  }

  return <LoginForm />;
}
