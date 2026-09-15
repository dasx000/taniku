"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, FlaskConical } from "lucide-react";
import { KOMODITAS_PUPUK, hitungTotalPerJenis } from "@/lib/pupuk-data";

function parseLuas(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatKg(value: number): string {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

export function PupukCalculator() {
  const [komoditasId, setKomoditasId] = useState(KOMODITAS_PUPUK[0].id);
  const [luasLahan, setLuasLahan] = useState("1");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const komoditas = useMemo(
    () => KOMODITAS_PUPUK.find((k) => k.id === komoditasId) ?? KOMODITAS_PUPUK[0],
    [komoditasId],
  );
  const luas = parseLuas(luasLahan);

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
    <div className="flex flex-col gap-4 pb-8 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-6">
        <Link
          href="/beranda"
          aria-label="Kembali ke Beranda"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-primary"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf/15">
            <FlaskConical className="h-5 w-5 text-leaf" strokeWidth={2} />
          </span>
          <h1 className="font-heading text-lg font-bold text-primary">Kalkulator Pupuk</h1>
        </div>
      </header>

      {/* Form */}
      <div className="flex flex-col gap-4 px-6">
        <div>
          <label htmlFor="komoditas" className="text-sm font-medium text-primary">
            Komoditas
          </label>
          <div ref={dropdownRef} className="relative mt-2">
            <button
              id="komoditas"
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              className="flex h-12 w-full items-center justify-between rounded-input border border-black/10 bg-card px-4 text-[15px] text-primary outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            >
              <span>{komoditas.nama}</span>
              <ChevronDown
                className={`h-5 w-5 text-secondary transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>

            {dropdownOpen ? (
              <div
                role="listbox"
                className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-black/5 bg-card p-1.5 shadow-[0_8px_24px_-8px_rgba(23,35,28,0.18)]"
              >
                {KOMODITAS_PUPUK.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    role="option"
                    aria-selected={k.id === komoditasId}
                    onClick={() => {
                      setKomoditasId(k.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      k.id === komoditasId
                        ? "bg-leaf/15 font-semibold text-forest"
                        : "text-primary"
                    }`}
                  >
                    {k.nama}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="luas-lahan" className="text-sm font-medium text-primary">
            Luas Lahan (hektar)
          </label>
          <input
            id="luas-lahan"
            type="text"
            inputMode="decimal"
            value={luasLahan}
            onChange={(e) => setLuasLahan(e.target.value)}
            placeholder="Contoh: 0.5"
            className="mt-2 h-12 w-full rounded-input border border-black/10 bg-card px-4 text-[15px] text-primary placeholder:text-secondary/70 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </div>
      </div>

      {/* Hasil */}
      <section className="mx-6 rounded-card border border-black/5 bg-card p-5">
        <h2 className="font-heading text-sm font-bold text-primary">
          Rekomendasi Dosis Pupuk {komoditas.nama}
        </h2>
        <p className="mt-0.5 text-xs text-secondary">Untuk luas lahan {formatKg(luas)} ha</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="w-[30%] rounded-l-md bg-forest px-1.5 py-1.5 text-left text-[10px] font-semibold leading-tight text-white">
                  Waktu Aplikasi
                </th>
                {komoditas.jenisPupuk.map((jenis, i) => (
                  <th
                    key={jenis}
                    className={`bg-forest px-1.5 py-1.5 text-center text-[10px] font-semibold leading-tight text-white ${
                      i === komoditas.jenisPupuk.length - 1 ? "rounded-r-md" : ""
                    }`}
                  >
                    {jenis}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {komoditas.jadwal.map((row, i) => (
                <tr key={row.waktu} className={i % 2 === 1 ? "bg-leaf/8" : undefined}>
                  <td className="px-1.5 py-1.5 text-[10px] leading-tight text-primary">
                    <div>{row.waktu}</div>
                    {row.keterangan ? (
                      <div className="text-[9px] text-secondary">{row.keterangan}</div>
                    ) : null}
                  </td>
                  {komoditas.jenisPupuk.map((jenis) => {
                    const dosis = row.dosisPerHaKg[jenis];
                    return (
                      <td
                        key={jenis}
                        className="px-1.5 py-1.5 text-center text-[10px] leading-tight text-primary"
                      >
                        {dosis == null ? (
                          <span className="text-secondary">-</span>
                        ) : (
                          `${formatKg(dosis * luas)} kg`
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-black/10">
                <td className="px-1.5 py-1.5 text-[10px] font-semibold leading-tight text-primary">
                  Jumlah
                </td>
                {komoditas.jenisPupuk.map((jenis) => (
                  <td
                    key={jenis}
                    className="px-1.5 py-1.5 text-center text-[10px] font-semibold leading-tight text-primary"
                  >
                    {formatKg(hitungTotalPerJenis(komoditas, jenis) * luas)} kg
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[9px] text-secondary">Sumber: PT Pupuk Indonesia</p>
      </section>

      {/* Ringkasan total per jenis pupuk -- dinamis ikut komoditas.jenisPupuk */}
      <section className="flex flex-col gap-2 px-6">
        <h2 className="font-heading text-sm font-bold text-primary">
          Total Kebutuhan Pupuk
        </h2>
        {komoditas.jenisPupuk.map((jenis) => (
          <div
            key={jenis}
            className="flex items-center justify-between rounded-2xl bg-leaf/10 px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf/20">
                <FlaskConical className="h-4 w-4 text-leaf" strokeWidth={2} />
              </span>
              <span className="text-sm font-medium text-primary">{jenis}</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {formatKg(hitungTotalPerJenis(komoditas, jenis) * luas)} kg
            </span>
          </div>
        ))}
      </section>

      <p className="px-6 text-center text-xs text-secondary">
        HST = Hari Setelah Tanam
      </p>
    </div>
  );
}
