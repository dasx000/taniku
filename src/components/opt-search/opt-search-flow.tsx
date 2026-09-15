"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight, Search } from "lucide-react";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  fetchBahanAktif,
  fetchKomoditasByKategori,
  fetchOptByKomoditas,
  fetchProdukTop,
  type BahanAktifResult,
  type KomoditasOption,
  type OptKategori,
  type OptOption,
  type ProdukTopResult,
} from "@/lib/supabase/opt-search";

type Step = "komoditas" | "opt" | "hasil";

const GENERIC_LOAD_ERROR = "Gagal memuat data. Coba lagi.";

// Sementara di-hardcode untuk tahap awal (baru dukung 2 komoditas utama).
// Saat search box diisi, pencarian tetap terbuka ke semua komoditas (lihat
// efek di bawah) -- ini cuma daftar default sebelum user mengetik apa pun.
const DEFAULT_KOMODITAS: KomoditasOption[] = [
  { id: 2, nama: "Padi" },
  { id: 10, nama: "Jagung" },
];

type OptSearchFlowProps = {
  kategori: OptKategori;
  title: string;
  searchLabel: string;
  icon: ReactNode;
  accentBg: string;
};

export function OptSearchFlow({
  kategori,
  title,
  searchLabel,
  icon,
  accentBg,
}: OptSearchFlowProps) {
  const [step, setStep] = useState<Step>("komoditas");

  const [komoditasQuery, setKomoditasQuery] = useState("");
  const [komoditasResults, setKomoditasResults] = useState<KomoditasOption[]>([]);
  const [komoditasLoading, setKomoditasLoading] = useState(false);
  const [selectedKomoditas, setSelectedKomoditas] = useState<KomoditasOption | null>(null);

  const [optQuery, setOptQuery] = useState("");
  const [optResults, setOptResults] = useState<OptOption[]>([]);
  const [optLoading, setOptLoading] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<OptOption | null>(null);

  const [komoditasError, setKomoditasError] = useState<string | null>(null);
  const [optError, setOptError] = useState<string | null>(null);

  const [bahanAktif, setBahanAktif] = useState<BahanAktifResult[]>([]);
  const [bahanAktifLoading, setBahanAktifLoading] = useState(false);
  const [bahanAktifError, setBahanAktifError] = useState<string | null>(null);

  const [produkExpanded, setProdukExpanded] = useState(false);
  const [produkList, setProdukList] = useState<ProdukTopResult[] | null>(null);
  const [produkLoading, setProdukLoading] = useState(false);
  const [produkError, setProdukError] = useState<string | null>(null);

  const debouncedKomoditasQuery = useDebouncedValue(komoditasQuery, 300);
  const debouncedOptQuery = useDebouncedValue(optQuery, 300);

  useEffect(() => {
    if (step !== "komoditas") return;
    let active = true;

    async function run() {
      if (debouncedKomoditasQuery.trim() === "") {
        setKomoditasResults(DEFAULT_KOMODITAS);
        setKomoditasError(null);
        setKomoditasLoading(false);
        return;
      }

      setKomoditasLoading(true);
      setKomoditasError(null);
      try {
        // Pencarian tetap terbuka ke semua komoditas (tidak dibatasi ke
        // DEFAULT_KOMODITAS) -- tapi hasil dibatasi 1 (paling cocok) karena
        // data komoditas sumbernya masih banyak varian duplikat/kotor.
        const data = await fetchKomoditasByKategori(kategori, debouncedKomoditasQuery, 1);
        if (active) setKomoditasResults(data);
      } catch {
        if (active) {
          setKomoditasResults([]);
          setKomoditasError(GENERIC_LOAD_ERROR);
        }
      } finally {
        if (active) setKomoditasLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [step, kategori, debouncedKomoditasQuery]);

  useEffect(() => {
    if (step !== "opt" || !selectedKomoditas) return;
    let active = true;

    async function run() {
      setOptLoading(true);
      setOptError(null);
      try {
        const data = await fetchOptByKomoditas(
          selectedKomoditas!.id,
          kategori,
          debouncedOptQuery,
        );
        if (active) setOptResults(data);
      } catch {
        if (active) {
          setOptResults([]);
          setOptError(GENERIC_LOAD_ERROR);
        }
      } finally {
        if (active) setOptLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [step, kategori, selectedKomoditas, debouncedOptQuery]);

  useEffect(() => {
    if (step !== "hasil" || !selectedKomoditas || !selectedOpt) return;
    let active = true;

    async function run() {
      setBahanAktifLoading(true);
      setBahanAktifError(null);
      try {
        const data = await fetchBahanAktif(selectedKomoditas!.id, selectedOpt!.id, kategori);
        if (active) setBahanAktif(data);
      } catch {
        if (active) {
          setBahanAktif([]);
          setBahanAktifError(GENERIC_LOAD_ERROR);
        }
      } finally {
        if (active) setBahanAktifLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [step, kategori, selectedKomoditas, selectedOpt]);

  function handleSelectKomoditas(k: KomoditasOption) {
    setSelectedKomoditas(k);
    setOptQuery("");
    setSelectedOpt(null);
    setStep("opt");
  }

  function handleSelectOpt(o: OptOption) {
    setSelectedOpt(o);
    setProdukExpanded(false);
    setProdukList(null);
    setStep("hasil");
  }

  function handleBack() {
    if (step === "hasil") {
      setStep("opt");
      setSelectedOpt(null);
    } else if (step === "opt") {
      setStep("komoditas");
      setSelectedKomoditas(null);
    }
  }

  async function handleToggleProduk() {
    const next = !produkExpanded;
    setProdukExpanded(next);
    if (next && produkList === null && selectedKomoditas && selectedOpt) {
      setProdukLoading(true);
      setProdukError(null);
      try {
        const data = await fetchProdukTop(selectedKomoditas.id, selectedOpt.id, kategori);
        setProdukList(data);
      } catch {
        setProdukError(GENERIC_LOAD_ERROR);
      } finally {
        setProdukLoading(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-8 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-6">
        {step === "komoditas" ? (
          <Link
            href="/beranda"
            aria-label="Kembali ke Beranda"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-primary"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-primary"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${accentBg}`}>
            {icon}
          </span>
          <h1 className="font-heading text-lg font-bold text-primary">{title}</h1>
        </div>
      </header>

      {/* Breadcrumb */}
      {selectedKomoditas ? (
        <div className="mx-6 flex items-center gap-2 rounded-2xl bg-leaf/15 px-4 py-3">
          <span className="text-sm font-semibold text-forest">{selectedKomoditas.nama}</span>
          {selectedOpt ? (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-forest/50" strokeWidth={2} />
              <span className="text-sm font-semibold text-forest">{selectedOpt.nama_umum}</span>
            </>
          ) : null}
        </div>
      ) : null}

      {step === "komoditas" ? (
        <StepList
          placeholder="Cari nama komoditas..."
          query={komoditasQuery}
          onQueryChange={setKomoditasQuery}
          loading={komoditasLoading}
          error={komoditasError}
          emptyText="Komoditas tidak ditemukan."
          items={komoditasResults}
          renderItem={(k) => (
            <SearchRow key={k.id} onClick={() => handleSelectKomoditas(k)} primary={k.nama} />
          )}
        />
      ) : null}

      {step === "opt" ? (
        <StepList
          placeholder={searchLabel}
          query={optQuery}
          onQueryChange={setOptQuery}
          loading={optLoading}
          error={optError}
          emptyText="Tidak ada data terdaftar untuk komoditas ini."
          items={optResults}
          renderItem={(o) => (
            <SearchRow
              key={o.id}
              onClick={() => handleSelectOpt(o)}
              primary={o.nama_umum ?? "-"}
              secondary={o.nama_latin ?? undefined}
            />
          )}
        />
      ) : null}

      {step === "hasil" && selectedKomoditas && selectedOpt ? (
        <div className="flex flex-col gap-4 px-6">
          <section className="rounded-card border border-black/5 bg-card p-5">
            <h2 className="font-heading text-sm font-bold text-primary">
              Bahan Aktif Terdaftar
            </h2>
            <p className="mt-0.5 text-xs text-secondary">
              Diurutkan dari yang paling banyak dipakai
            </p>

            {bahanAktifLoading ? (
              <SkeletonRows count={3} />
            ) : bahanAktifError ? (
              <p className="mt-3 text-sm text-danger">{bahanAktifError}</p>
            ) : bahanAktif.length === 0 ? (
              <p className="mt-3 text-sm text-secondary">
                Belum ada bahan aktif terdaftar untuk kombinasi ini.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {bahanAktif.map((b) => (
                  <li
                    key={b.nama}
                    className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5"
                  >
                    <span className="text-sm text-primary">{b.nama}</span>
                    <span className="text-xs text-secondary">{b.jumlah_produk} produk</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="overflow-hidden rounded-card border border-black/5 bg-card">
            <button
              type="button"
              onClick={handleToggleProduk}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <span className="text-sm font-semibold text-primary">
                Lihat rekomendasi produk
              </span>
              <ChevronDown
                className={`h-5 w-5 text-secondary transition-transform ${
                  produkExpanded ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>

            {produkExpanded ? (
              <div className="flex flex-col gap-3 border-t border-black/5 px-5 pb-5 pt-4">
                <p className="text-xs italic text-secondary">
                  *Urutan berdasarkan status registrasi terbaru, bukan data penjualan
                  atau efektivitas asli.
                </p>

                {produkLoading ? (
                  <SkeletonRows count={3} />
                ) : produkError ? (
                  <p className="text-sm text-danger">{produkError}</p>
                ) : produkList && produkList.length === 0 ? (
                  <p className="text-sm text-secondary">Belum ada produk terdaftar.</p>
                ) : (
                  produkList?.map((p) => (
                    <article key={p.produk_id} className="rounded-2xl bg-background p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-primary">{p.nama}</p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            p.berlaku ? "bg-leaf/15 text-leaf" : "bg-danger/12 text-danger"
                          }`}
                        >
                          {p.berlaku ? "Berlaku" : "Kedaluwarsa"}
                        </span>
                      </div>
                      {p.perusahaan ? (
                        <p className="mt-0.5 text-xs text-secondary">{p.perusahaan}</p>
                      ) : null}
                      {p.bahan_aktif ? (
                        <p className="mt-1.5 text-xs text-secondary">
                          Bahan aktif: {p.bahan_aktif}
                        </p>
                      ) : null}
                      {p.dosis ? (
                        <p className="text-xs text-secondary">Dosis: {p.dosis}</p>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            ) : null}
          </section>

          <button
            type="button"
            onClick={() => {
              setStep("komoditas");
              setSelectedKomoditas(null);
              setSelectedOpt(null);
              setKomoditasQuery("");
            }}
            className="self-center text-sm font-semibold text-forest"
          >
            Ganti komoditas
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StepList<T>({
  placeholder,
  query,
  onQueryChange,
  loading,
  error,
  emptyText,
  items,
  renderItem,
}: {
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  loading: boolean;
  error?: string | null;
  emptyText: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-input border border-black/10 bg-card pl-11 pr-4 text-[15px] text-primary placeholder:text-secondary/70 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <SkeletonRows count={5} />
        ) : error ? (
          <p className="py-6 text-center text-sm text-danger">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-secondary">{emptyText}</p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
}

function SearchRow({
  onClick,
  primary,
  secondary,
}: {
  onClick: () => void;
  primary: string;
  secondary?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl border border-black/5 bg-card px-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-primary">{primary}</span>
        {secondary ? (
          <span className="block truncate text-xs italic text-secondary">{secondary}</span>
        ) : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2} />
    </button>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-2xl bg-black/5" />
      ))}
    </div>
  );
}
