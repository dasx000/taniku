type BmkgCuacaEntry = {
  t: number;
  hu: number;
  ws: number;
  tp: number;
  weather_desc: string;
  local_datetime: string; // "YYYY-MM-DD HH:mm:ss", waktu lokal (Asia/Jakarta)
};

type BmkgResponse = {
  lokasi?: {
    desa?: string;
    kecamatan?: string;
    kotkab?: string;
    provinsi?: string;
  };
  data?: Array<{
    cuaca?: BmkgCuacaEntry[][];
  }>;
};

export type WeatherHour = {
  jam: string; // "15:00"
  suhu: number;
  deskripsi: string;
};

export type WeatherDay = {
  label: string; // "Hari Ini" | "Besok" | nama hari ("Rabu", dst)
  deskripsi: string; // representatif siang hari
  suhuMin: number;
  suhuMax: number;
  jam: WeatherHour[];
};

export type WeatherData = {
  lokasiText: string;
  current: {
    suhu: number;
    suhuMin: number;
    suhuMax: number;
    deskripsi: string;
    kelembapan: number;
    anginKmj: number;
    curahHujanMm: number;
  };
  harian: WeatherDay[];
};

function dayLabel(index: number): string {
  if (index === 0) return "Hari Ini";
  if (index === 1) return "Besok";
  if (index === 2) return "Lusa";
  return `${index} Hari Lagi`;
}

function representative(entries: BmkgCuacaEntry[]): BmkgCuacaEntry {
  // Ambil entri dengan jam paling dekat ke tengah hari (12:00) sebagai ikon/deskripsi mewakili hari itu.
  return entries.reduce((closest, entry) => {
    const hour = Number(entry.local_datetime.slice(11, 13));
    const closestHour = Number(closest.local_datetime.slice(11, 13));
    return Math.abs(hour - 12) < Math.abs(closestHour - 12) ? entry : closest;
  }, entries[0]);
}

/**
 * Ambil prakiraan cuaca dari API publik BMKG (data.bmkg.go.id) berdasarkan
 * kode wilayah adm4 (desa/kelurahan) yang tersimpan di profil user.
 * BMKG update datanya tiap ~6 jam, jadi cache 30 menit di sisi kita cukup.
 *
 * Catatan: endpoint ini cuma menyediakan prakiraan 3 hari ke depan (bukan 5) --
 * itu batas data resmi dari BMKG untuk endpoint publik ini, bukan pembatasan
 * dari kita.
 */
export async function getWeatherByKodeWilayah(kodeWilayah: string): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(kodeWilayah)}`,
      { next: { revalidate: 1800 } },
    );

    if (!res.ok) return null;

    const json = (await res.json()) as BmkgResponse;
    const lokasi = json.lokasi;
    const cuacaByHari = json.data?.[0]?.cuaca;

    if (!lokasi || !cuacaByHari || cuacaByHari.length === 0) return null;

    const harian: WeatherDay[] = cuacaByHari
      .filter((entries) => entries.length > 0)
      .map((entries, index) => {
        const rep = representative(entries);
        const suhu = entries.map((e) => e.t);
        return {
          label: dayLabel(index),
          deskripsi: rep.weather_desc,
          suhuMin: Math.min(...suhu),
          suhuMax: Math.max(...suhu),
          jam: entries.map((e) => ({
            jam: e.local_datetime.slice(11, 16),
            suhu: e.t,
            deskripsi: e.weather_desc,
          })),
        };
      });

    const hariIni = harian[0];
    const current = cuacaByHari[0][0] ?? cuacaByHari.flat()[0];
    if (!hariIni || !current) return null;

    return {
      lokasiText: [lokasi.desa, lokasi.kotkab].filter(Boolean).join(", "),
      current: {
        suhu: current.t,
        suhuMin: hariIni.suhuMin,
        suhuMax: hariIni.suhuMax,
        deskripsi: current.weather_desc,
        kelembapan: current.hu,
        anginKmj: Math.round(current.ws),
        curahHujanMm: current.tp,
      },
      harian,
    };
  } catch {
    return null;
  }
}
