"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, User } from "lucide-react";
import { Spinner } from "@/components/spinner";
import { WilayahSelect } from "@/components/wilayah-select";
import { createClient } from "@/lib/supabase/client";
import {
  getProvinsiList,
  getWilayahChildren,
  type WilayahOption,
} from "@/lib/supabase/wilayah";

export function EditProfilForm({
  fullName: initialFullName,
  phone: initialPhone,
  provinsi: initialProvinsi,
  kabupaten: initialKabupaten,
  kecamatan: initialKecamatan,
  desa: initialDesa,
  kodeWilayah: initialKodeWilayah,
}: {
  fullName: string;
  phone: string;
  provinsi: string | null;
  kabupaten: string | null;
  kecamatan: string | null;
  desa: string | null;
  kodeWilayah: string | null;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [provinsiList, setProvinsiList] = useState<WilayahOption[]>([]);
  const [kabupatenList, setKabupatenList] = useState<WilayahOption[]>([]);
  const [kecamatanList, setKecamatanList] = useState<WilayahOption[]>([]);
  const [desaList, setDesaList] = useState<WilayahOption[]>([]);

  const [selectedProvinsi, setSelectedProvinsi] = useState<WilayahOption | null>(
    initialKodeWilayah ? { kode: initialKodeWilayah.split(".")[0], nama: initialProvinsi ?? "" } : null,
  );
  const [selectedKabupaten, setSelectedKabupaten] = useState<WilayahOption | null>(
    initialKodeWilayah
      ? {
          kode: initialKodeWilayah.split(".").slice(0, 2).join("."),
          nama: initialKabupaten ?? "",
        }
      : null,
  );
  const [selectedKecamatan, setSelectedKecamatan] = useState<WilayahOption | null>(
    initialKodeWilayah
      ? {
          kode: initialKodeWilayah.split(".").slice(0, 3).join("."),
          nama: initialKecamatan ?? "",
        }
      : null,
  );
  const [selectedDesa, setSelectedDesa] = useState<WilayahOption | null>(
    initialKodeWilayah ? { kode: initialKodeWilayah, nama: initialDesa ?? "" } : null,
  );

  useEffect(() => {
    let active = true;

    async function init() {
      const provList = await getProvinsiList();
      if (!active) return;
      setProvinsiList(provList);

      if (initialKodeWilayah) {
        const parts = initialKodeWilayah.split(".");
        const provKode = parts[0];
        const kabKode = parts.slice(0, 2).join(".");
        const kecKode = parts.slice(0, 3).join(".");

        const [kabList, kecList, desaListRes] = await Promise.all([
          getWilayahChildren(provKode),
          getWilayahChildren(kabKode),
          getWilayahChildren(kecKode),
        ]);
        if (!active) return;
        setKabupatenList(kabList);
        setKecamatanList(kecList);
        setDesaList(desaListRes);
      }
    }

    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProvinsiChange(opt: WilayahOption) {
    setSelectedProvinsi(opt);
    setSelectedKabupaten(null);
    setSelectedKecamatan(null);
    setSelectedDesa(null);
    setKecamatanList([]);
    setDesaList([]);
    const list = await getWilayahChildren(opt.kode);
    setKabupatenList(list);
  }

  async function handleKabupatenChange(opt: WilayahOption) {
    setSelectedKabupaten(opt);
    setSelectedKecamatan(null);
    setSelectedDesa(null);
    setDesaList([]);
    const list = await getWilayahChildren(opt.kode);
    setKecamatanList(list);
  }

  async function handleKecamatanChange(opt: WilayahOption) {
    setSelectedKecamatan(opt);
    setSelectedDesa(null);
    const list = await getWilayahChildren(opt.kode);
    setDesaList(list);
  }

  function handleDesaChange(opt: WilayahOption) {
    setSelectedDesa(opt);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        provinsi: selectedProvinsi?.nama ?? null,
        kabupaten: selectedKabupaten?.nama ?? null,
        kecamatan: selectedKecamatan?.nama ?? null,
        desa: selectedDesa?.nama ?? null,
        kode_wilayah: selectedDesa?.kode ?? null,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? "Nomor HP sudah dipakai akun lain."
          : "Gagal menyimpan perubahan. Coba lagi.",
      );
      setLoading(false);
      return;
    }

    router.push("/profil");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 pt-6">
      <header className="flex items-center gap-3 px-6">
        <Link
          href="/profil"
          aria-label="Kembali ke Profil"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-primary"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="font-heading text-lg font-bold text-primary">Edit Profil</h1>
      </header>

      <form className="flex flex-col gap-4 px-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">
            Nama Lengkap
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 w-full rounded-input border border-black/10 bg-card pl-11 pr-4 text-[15px] text-primary outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-secondary">
            Nomor HP
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              type="tel"
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 w-full rounded-input border border-black/10 bg-card pl-11 pr-4 text-[15px] text-primary placeholder:text-secondary/70 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            />
          </div>
        </div>

        <div className="mt-2 border-t border-black/5 pt-4">
          <p className="text-sm font-semibold text-primary">Domisili</p>
          <p className="mt-0.5 text-xs text-secondary">
            Dipakai untuk menampilkan prakiraan cuaca yang sesuai lokasi Anda.
          </p>
        </div>

        <WilayahSelect
          label="Provinsi"
          placeholder="Pilih provinsi"
          value={selectedProvinsi}
          options={provinsiList}
          onChange={handleProvinsiChange}
        />

        <WilayahSelect
          label="Kabupaten/Kota"
          placeholder="Pilih kabupaten/kota"
          value={selectedKabupaten}
          options={kabupatenList}
          onChange={handleKabupatenChange}
          disabled={!selectedProvinsi}
        />

        <WilayahSelect
          label="Kecamatan"
          placeholder="Pilih kecamatan"
          value={selectedKecamatan}
          options={kecamatanList}
          onChange={handleKecamatanChange}
          disabled={!selectedKabupaten}
        />

        <WilayahSelect
          label="Desa/Kelurahan"
          placeholder="Pilih desa/kelurahan"
          value={selectedDesa}
          options={desaList}
          onChange={handleDesaChange}
          disabled={!selectedKecamatan}
        />

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-button bg-forest text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(22,131,75,0.5)] transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? <Spinner className="h-4 w-4" /> : null}
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
