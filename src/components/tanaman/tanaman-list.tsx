"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleDot,
  Clock,
  LandPlot,
  LeafyGreen,
  MapPin,
  Plus,
  Search,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type {
  LahanStatus,
  TahapanRow,
  TahapanStatus,
  TanamanRow,
} from "@/lib/supabase/queries";

const SEMUA = "Semua";

const KOMODITAS_META: Record<string, { icon: LucideIcon; bg: string; text: string }> = {
  Padi: { icon: Wheat, bg: "bg-warning/15", text: "text-warning" },
  Jagung: { icon: LeafyGreen, bg: "bg-leaf/15", text: "text-leaf" },
};

const STATUS_META: Record<LahanStatus, { label: string; dot: string; text: string }> = {
  akan_tanam: { label: "Akan Tanam", dot: "bg-warning", text: "text-warning" },
  persiapan: { label: "Persiapan", dot: "bg-weather", text: "text-weather" },
  dalam_proses: { label: "Dalam Proses", dot: "bg-forest", text: "text-forest" },
  panen: { label: "Panen", dot: "bg-info", text: "text-info" },
};

const TAHAP_META: Record<TahapanStatus, { label: string; icon: LucideIcon; bg: string; text: string }> = {
  selesai: { label: "Selesai", icon: CircleCheck, bg: "bg-forest/12", text: "text-forest" },
  berjalan: { label: "Berjalan", icon: CircleDot, bg: "bg-weather/15", text: "text-weather" },
  belum_mulai: { label: "Belum Mulai", icon: Clock, bg: "bg-black/5", text: "text-secondary" },
};

function formatHa(value: number): string {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function formatTanggal(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRentang(mulai: string | null, selesai: string | null): string {
  if (!mulai && !selesai) return "-";
  return `${formatTanggal(mulai)} - ${formatTanggal(selesai)}`;
}

function komoditasMeta(komoditas: string | null) {
  return (komoditas ? KOMODITAS_META[komoditas] : undefined) ?? {
    icon: Sprout,
    bg: "bg-leaf/15",
    text: "text-leaf",
  };
}

function TahapanTimeline({ tahapan }: { tahapan: TahapanRow[] }) {
  const sorted = [...tahapan].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="rounded-2xl bg-black/[0.03] p-4">
      <p className="text-sm font-semibold text-primary">Tahapan Budidaya</p>
      <div className="mt-3 flex flex-col">
        {sorted.map((tahap, idx) => {
          const meta = TAHAP_META[tahap.status];
          const Icon = meta.icon;
          const isLast = idx === sorted.length - 1;
          return (
            <div key={tahap.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                    tahap.status === "belum_mulai" ? "bg-secondary/40" : "bg-forest"
                  }`}
                >
                  {tahap.urutan}
                </span>
                {!isLast ? <span className="w-px flex-1 bg-black/10" /> : null}
              </div>
              <div className={`flex-1 ${isLast ? "" : "pb-4"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-primary">{tahap.nama_tahap}</p>
                    <p className="text-xs text-secondary">
                      {formatRentang(tahap.tanggal_mulai, tahap.tanggal_selesai)}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.bg} ${meta.text}`}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2.25} />
                    {meta.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TanamanList({ tanamanList }: { tanamanList: TanamanRow[] }) {
  const [filter, setFilter] = useState(SEMUA);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const totalKomoditas = useMemo(
    () => new Set(tanamanList.map((t) => t.komoditas).filter(Boolean)).size,
    [tanamanList],
  );
  const totalHa = tanamanList.reduce((sum, t) => sum + t.luas_ha, 0);

  const filtered = tanamanList.filter((t) => {
    const matchFilter = filter === SEMUA || t.komoditas === filter;
    const q = query.trim().toLowerCase();
    const matchQuery =
      q.length === 0 ||
      t.nama.toLowerCase().includes(q) ||
      (t.komoditas ?? "").toLowerCase().includes(q) ||
      (t.lokasi ?? "").toLowerCase().includes(q);
    return matchFilter && matchQuery;
  });

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-6 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-6">
        <Link
          href="/beranda"
          aria-label="Kembali ke Beranda"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-primary"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="font-heading text-lg font-bold text-primary">Tanaman Saya</h1>
      </header>

      <p className="px-6 text-sm text-secondary">
        Kelola data tanaman yang Anda budidayakan untuk mendapatkan rekomendasi yang lebih tepat.
      </p>

      {tanamanList.length === 0 ? (
        <div className="mx-6 flex flex-col items-center gap-4 rounded-card bg-card py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf/15">
            <Sprout className="h-6 w-6 text-leaf" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">Belum ada tanaman terdaftar</p>
            <p className="mx-auto mt-1 max-w-[240px] text-xs text-secondary">
              Tambahkan lahan Padi atau Jagung Anda lewat tombol di bawah.
            </p>
          </div>
          <Link
            href="/lahan/tambah"
            className="flex h-11 items-center gap-2 rounded-button bg-forest px-5 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Tambah Lahan
          </Link>
        </div>
      ) : (
        <>
          {/* Ringkasan */}
          <section className="mx-6 flex items-center rounded-card bg-leaf/12 px-5 py-4">
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf/20">
                <Sprout className="h-5 w-5 text-forest" strokeWidth={2} />
              </span>
              <div>
                <p className="text-xs text-secondary">Total Tanaman</p>
                <p className="font-heading text-base font-bold text-forest">
                  {totalKomoditas} Komoditas
                </p>
              </div>
            </div>
            <div className="mx-3 h-10 w-px bg-black/10" />
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf/20">
                <LandPlot className="h-5 w-5 text-forest" strokeWidth={2} />
              </span>
              <div>
                <p className="text-xs text-secondary">Total Lahan</p>
                <p className="font-heading text-base font-bold text-forest">
                  {formatHa(totalHa)} Ha
                </p>
              </div>
            </div>
          </section>

          {/* Filter komoditas */}
          <div className="flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[SEMUA, "Padi", "Jagung"].map((f) => {
              const meta = f === SEMUA ? null : komoditasMeta(f);
              const Icon = meta?.icon ?? Sprout;
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-forest text-white"
                      : "border border-black/10 bg-card text-primary"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-white" : meta?.text ?? "text-leaf"}`} strokeWidth={2} />
                  {f}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="px-6">
            <div className="flex h-11 items-center gap-2 rounded-input border border-black/10 bg-card px-4">
              <Search className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari lahan..."
                className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-secondary"
              />
            </div>
          </div>

          <h2 className="px-6 font-heading text-base font-bold text-primary">Daftar Lahan</h2>

          {/* Daftar tanaman */}
          <div className="flex flex-col gap-3 px-6">
            {filtered.map((tanaman) => {
              const meta = komoditasMeta(tanaman.komoditas);
              const Icon = meta.icon;
              const statusMeta = tanaman.status ? STATUS_META[tanaman.status] : null;
              const isOpen = expanded.has(tanaman.id);

              return (
                <div
                  key={tanaman.id}
                  className="rounded-card border border-black/5 bg-card p-4"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(tanaman.id)}
                    className="flex w-full items-start gap-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                      <Icon className={`h-6 w-6 ${meta.text}`} strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-primary">
                        {tanaman.nama} - {tanaman.komoditas}
                      </p>
                      {statusMeta ? (
                        <span className={`mt-0.5 flex items-center gap-1.5 text-xs font-medium ${statusMeta.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                          {statusMeta.label}
                        </span>
                      ) : null}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
                        {tanaman.lokasi ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                            {tanaman.lokasi}
                          </span>
                        ) : null}
                        <span className="flex items-center gap-1">
                          <LandPlot className="h-3.5 w-3.5" strokeWidth={2} />
                          {formatHa(tanaman.luas_ha)} Ha
                        </span>
                      </div>
                      {tanaman.tanggal_tanam ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-secondary">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                          Tanam: {formatTanggal(tanaman.tanggal_tanam)}
                        </p>
                      ) : null}
                    </div>
                    {tanaman.lahan_tahapan.length > 0 ? (
                      isOpen ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2} />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2} />
                      )
                    ) : null}
                  </button>

                  {isOpen && tanaman.lahan_tahapan.length > 0 ? (
                    <div className="mt-4">
                      <TahapanTimeline tahapan={tanaman.lahan_tahapan} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="px-6">
            <Link
              href="/lahan/tambah"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-button bg-forest text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(22,131,75,0.4)] transition active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" strokeWidth={2.25} />
              Tambah Lahan
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
