import { Spinner } from "@/components/spinner";

/**
 * Dipakai untuk tombol icon-only (tanpa label teks yang bisa diganti jadi
 * "Memproses..."). Menutup layar dengan lapisan redup + spinner supaya
 * jelas kelihatan app sedang bekerja, bukan diam/bengong.
 */
export function LoadingOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Spinner className="h-8 w-8 text-white" />
    </div>
  );
}
