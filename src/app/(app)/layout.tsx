import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="mx-auto w-full max-w-[430px] flex-1 pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
