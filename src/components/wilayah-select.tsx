"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { WilayahOption } from "@/lib/supabase/wilayah";

export function WilayahSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: WilayahOption | null;
  options: WilayahOption[];
  onChange: (option: WilayahOption) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.nama.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-secondary">{label}</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!open && ref.current) {
              const spaceBelow = window.innerHeight - ref.current.getBoundingClientRect().bottom;
              setDropUp(spaceBelow < 320);
            }
            setOpen((v) => !v);
            setQuery("");
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-12 w-full items-center justify-between rounded-input border border-black/10 bg-card px-4 text-[15px] text-primary outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 disabled:opacity-50"
        >
          <span className={value ? "text-primary" : "text-secondary/70"}>
            {value?.nama ?? placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-secondary transition-transform ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={2}
          />
        </button>

        {open ? (
          <div
            className={`absolute z-[60] w-full overflow-hidden rounded-2xl border border-black/5 bg-card shadow-[0_8px_24px_-8px_rgba(23,35,28,0.18)] ${
              dropUp ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {options.length > 6 ? (
              <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-secondary" strokeWidth={2} />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari..."
                  className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-secondary"
                />
              </div>
            ) : null}

            <div role="listbox" className="max-h-60 overflow-y-auto p-1.5">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-secondary">Tidak ada pilihan</p>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.kode}
                    type="button"
                    role="option"
                    aria-selected={opt.kode === value?.kode}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      opt.kode === value?.kode ? "bg-leaf/15 font-semibold text-forest" : "text-primary"
                    }`}
                  >
                    {opt.nama}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
