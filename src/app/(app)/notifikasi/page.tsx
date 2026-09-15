import { Bell } from "lucide-react";

export default function NotifikasiPage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <header className="px-6">
        <h1 className="font-heading text-xl font-bold text-primary">Notifikasi</h1>
      </header>
      <div className="mx-6 flex flex-col items-center justify-center gap-3 rounded-card bg-card py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/12">
          <Bell className="h-6 w-6 text-danger" strokeWidth={2} />
        </span>
        <p className="text-sm font-medium text-primary">Belum ada notifikasi</p>
        <p className="max-w-[220px] text-xs text-secondary">
          Pemberitahuan penting akan muncul di sini.
        </p>
      </div>
    </div>
  );
}
