"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MapPin,
  Plus,
  Ruler,
  Sprout,
  Map as MapIcon,
} from "lucide-react";
import type { LahanRow } from "@/lib/supabase/queries";

const SEMUA_LAHAN = "Semua Lahan";

function formatHa(value: number): string {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

export function LahanList({ lahanList }: { lahanList: LahanRow[] }) {
  const [filter, setFilter] = useState(SEMUA_LAHAN);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const komoditasList = useMemo(() => {
    const unique = Array.from(
      new Set(lahanList.map((l) => l.komoditas).filter((k): k is string => Boolean(k))),
    );
    return unique.sort((a, b) => a.localeCompare(b, "id"));
  }, [lahanList]);

  const filters = [SEMUA_LAHAN, ...komoditasList];

  const filtered =
    filter === SEMUA_LAHAN ? lahanList : lahanList.filter((l) => l.komoditas === filter);

  const totalHa = lahanList.reduce((sum, l) => sum + l.luas_ha, 0);

  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
        <h1 className="font-heading text-lg font-bold text-primary">Lahan Saya</h1>
      </header>

      <p className="px-6 text-sm text-secondary">
        Kelola data lahan pertanian Anda untuk mendukung produktivitas yang lebih baik.
      </p>

      {lahanList.length === 0 ? (
        <div className="mx-6 flex flex-col items-center gap-4 rounded-card bg-card py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf/15">
            <Sprout className="h-6 w-6 text-leaf" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">Belum ada lahan terdaftar</p>
            <p className="mx-auto mt-1 max-w-[240px] text-xs text-secondary">
              Tambahkan lahan pertama Anda lewat tombol di bawah.
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
          {/* Ringkasan total lahan */}
          <section className="mx-6 flex items-center gap-3 rounded-card bg-leaf/12 px-5 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf/20">
              <MapIcon className="h-5 w-5 text-forest" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs text-secondary">Total Lahan</p>
              <p className="font-heading text-lg font-bold text-forest">{formatHa(totalHa)} Ha</p>
              <p className="text-xs text-secondary">{lahanList.length} lahan terdaftar</p>
            </div>
          </section>

          <div className="px-6">
            <Link
              href="/lahan/tambah"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-button bg-forest text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(22,131,75,0.4)] transition active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" strokeWidth={2.25} />
              Tambah Lahan
            </Link>
          </div>

          {/* Filter komoditas -- dinamis dari komoditas yang benar-benar ada di data user */}
          <div ref={dropdownRef} className="relative px-6">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              className="flex h-11 w-full items-center justify-between rounded-input border border-black/10 bg-card px-4 text-sm text-primary outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            >
              <span className="font-medium">{filter}</span>
              <ChevronDown
                className={`h-4 w-4 text-secondary transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>

            {dropdownOpen ? (
              <div
                role="listbox"
                className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-black/5 bg-card p-1.5 shadow-[0_8px_24px_-8px_rgba(23,35,28,0.18)]"
              >
                {filters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="option"
                    aria-selected={f === filter}
                    onClick={() => {
                      setFilter(f);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      f === filter ? "bg-leaf/15 font-semibold text-forest" : "text-primary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Daftar lahan */}
          <div className="flex flex-col gap-3 px-6">
            {filtered.map((lahan) => (
              <div
                key={lahan.id}
                className="flex items-center gap-3 rounded-card border border-black/5 bg-card p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf/15">
                  <Sprout className="h-5 w-5 text-leaf" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary">{lahan.nama}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-secondary">
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3.5 w-3.5" strokeWidth={2} />
                      {formatHa(lahan.luas_ha)} Ha
                    </span>
                    {lahan.komoditas ? (
                      <span className="flex items-center gap-1">
                        <Sprout className="h-3.5 w-3.5" strokeWidth={2} />
                        {lahan.komoditas}
                      </span>
                    ) : null}
                  </div>
                  {lahan.lokasi ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-secondary">
                      <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      {lahan.lokasi}
                    </p>
                  ) : null}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
