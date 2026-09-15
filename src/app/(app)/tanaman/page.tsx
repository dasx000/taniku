import { getMyTanaman } from "@/lib/supabase/queries";
import { TanamanList } from "@/components/tanaman/tanaman-list";

export default async function TanamanPage() {
  const tanamanList = await getMyTanaman();

  return <TanamanList tanamanList={tanamanList} />;
}
