import { Bug } from "lucide-react";
import { OptSearchFlow } from "@/components/opt-search/opt-search-flow";

export default function HamaPage() {
  return (
    <OptSearchFlow
      kategori="hama"
      title="Kendali Hama"
      searchLabel="Cari nama hama..."
      icon={<Bug className="h-5 w-5 text-danger" strokeWidth={2} />}
      accentBg="bg-danger/12"
    />
  );
}
