import { Sprout } from "lucide-react";
import { OptSearchFlow } from "@/components/opt-search/opt-search-flow";

export default function GulmaPage() {
  return (
    <OptSearchFlow
      kategori="gulma"
      title="Kendali Gulma"
      searchLabel="Cari nama gulma..."
      icon={<Sprout className="h-5 w-5 text-warning" strokeWidth={2} />}
      accentBg="bg-warning/12"
    />
  );
}
