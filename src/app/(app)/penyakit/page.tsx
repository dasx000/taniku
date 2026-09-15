import { Stethoscope } from "lucide-react";
import { OptSearchFlow } from "@/components/opt-search/opt-search-flow";

export default function PenyakitPage() {
  return (
    <OptSearchFlow
      kategori="penyakit"
      title="Kendali Penyakit"
      searchLabel="Cari nama penyakit..."
      icon={<Stethoscope className="h-5 w-5 text-info" strokeWidth={2} />}
      accentBg="bg-info/12"
    />
  );
}
