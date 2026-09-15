import { getMyLahan } from "@/lib/supabase/queries";
import { LahanList } from "@/components/lahan/lahan-list";

export default async function LahanPage() {
  const lahanList = await getMyLahan();

  return <LahanList lahanList={lahanList} />;
}
