import { Newspaper } from "lucide-react";

export default function InformasiPage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <header className="px-6">
        <h1 className="font-heading text-xl font-bold text-primary">Informasi</h1>
      </header>
      <div className="mx-6 flex flex-col items-center justify-center gap-3 rounded-card bg-card py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-info/12">
          <Newspaper className="h-6 w-6 text-info" strokeWidth={2} />
        </span>
        <p className="text-sm font-medium text-primary">Segera hadir</p>
        <p className="max-w-[220px] text-xs text-secondary">
          Artikel dan info budidaya akan tampil di sini.
        </p>
      </div>
    </div>
  );
}
