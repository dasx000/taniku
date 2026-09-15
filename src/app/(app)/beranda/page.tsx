import Link from "next/link";
import {
  Bell,
  Bug,
  CloudRain,
  CloudSun,
  Droplets,
  FlaskConical,
  Leaf,
  MapPin,
  Wind,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { ROLE_LABEL, getGreeting, getInitials } from "@/lib/profile";
import { FeatureGrid } from "@/components/feature-grid";
import { WeatherIcon } from "@/components/weather-icon";
import { WeatherStat } from "@/components/weather-stat";
import { getWeatherByKodeWilayah } from "@/lib/bmkg";

const TIPS = [
  {
    title: "Waspada Wereng Coklat",
    desc: "Musim ini rawan serangan wereng coklat pada tanaman padi.",
    icon: Bug,
    bg: "bg-danger/12",
    text: "text-danger",
  },
  {
    title: "Tips Pemupukan Musim Hujan",
    desc: "Atur dosis & waktu pupuk agar tidak larut terbawa air hujan.",
    icon: FlaskConical,
    bg: "bg-leaf/15",
    text: "text-leaf",
  },
  {
    title: "Info Harga Gabah",
    desc: "Cek pergerakan harga gabah terbaru di wilayahmu minggu ini.",
    icon: Leaf,
    bg: "bg-info/12",
    text: "text-info",
  },
];

export default async function BerandaPage() {
  const profile = await getCurrentProfile();
  const fullName = profile?.full_name ?? "Pengguna";
  const weather = profile?.kode_wilayah
    ? await getWeatherByKodeWilayah(profile.kode_wilayah)
    : null;

  return (
    <div className="flex flex-col gap-6 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest/10 text-sm font-bold text-forest">
            {getInitials(fullName)}
          </div>
          <div>
            <p className="text-xs text-secondary">{getGreeting()}</p>
            <p className="font-heading text-[15px] font-bold leading-tight text-primary">
              {fullName}
            </p>
            <p className="text-[11px] font-semibold text-forest">
              {profile ? ROLE_LABEL[profile.role] : ""}
            </p>
          </div>
        </div>
        <Link
          href="/notifikasi"
          aria-label="Notifikasi"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-primary"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        </Link>
      </header>

      {/* Weather card -- data dari API BMKG berdasarkan kode_wilayah di profil */}
      {weather ? (
        <Link href="/cuaca" className="mx-6 block rounded-card bg-weather/12 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-secondary">Cuaca Hari Ini</p>
              <p className="mt-1 font-heading text-base font-bold text-primary">
                {weather.current.deskripsi}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-secondary">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                {weather.lokasiText}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <WeatherIcon deskripsi={weather.current.deskripsi} />
              <p className="mt-1 font-heading text-3xl font-bold text-primary">
                {weather.current.suhu}°C
              </p>
              <p className="text-xs text-secondary">
                {weather.current.suhuMin}° - {weather.current.suhuMax}°
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/10 pt-3">
            <WeatherStat icon={Droplets} label="Kelembapan" value={`${weather.current.kelembapan}%`} />
            <WeatherStat icon={Wind} label="Angin" value={`${weather.current.anginKmj} km/j`} />
            <WeatherStat icon={CloudRain} label="Curah Hujan" value={`${weather.current.curahHujanMm} mm`} />
          </div>
        </Link>
      ) : (
        <div className="mx-6 flex items-center gap-3 rounded-card bg-weather/12 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-weather/20">
            <CloudSun className="h-5 w-5 text-weather" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary">Cuaca belum tersedia</p>
            <p className="mt-0.5 text-xs text-secondary">
              Lengkapi domisili di profil untuk melihat prakiraan cuaca lokasi Anda.
            </p>
          </div>
          <Link
            href="/profil/edit"
            className="shrink-0 rounded-button bg-forest px-3 py-2 text-xs font-semibold text-white"
          >
            Atur
          </Link>
        </div>
      )}

      {/* Featured recommendation */}
      <section className="relative mx-6 overflow-hidden rounded-card bg-forest p-5">
        <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -right-4 h-28 w-28 rounded-full bg-leaf/25" />
        <div className="relative">
          <p className="font-heading text-lg font-bold text-white">Saatnya Tanam!</p>
          <p className="mt-1 max-w-[220px] text-sm leading-relaxed text-white/85">
            Ikuti jadwal tanam yang sesuai untuk kondisi lahan Anda.
          </p>
          <Link
            href="/jadwal-tanam"
            className="mt-4 inline-flex h-10 items-center rounded-button bg-white px-4 text-sm font-semibold text-forest"
          >
            Lihat Jadwal Tanam
          </Link>
        </div>
      </section>

      {/* Fitur Pertanian */}
      <section className="px-6">
        <h2 className="font-heading text-base font-bold text-primary">
          Fitur Pertanian
        </h2>
        <FeatureGrid />
      </section>

      {/* Untuk Anda */}
      <section className="pb-2">
        <h2 className="px-6 font-heading text-base font-bold text-primary">
          Untuk Anda
        </h2>
        <div className="mt-3 flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
          {TIPS.map(({ title, desc, icon: Icon, bg, text }) => (
            <article
              key={title}
              className="w-[240px] shrink-0 snap-start rounded-card border border-black/5 bg-card p-4 shadow-[0_2px_10px_-4px_rgba(23,35,28,0.08)]"
            >
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${bg}`}>
                <Icon className={`h-4 w-4 ${text}`} strokeWidth={2} />
              </span>
              <p className="mt-3 text-sm font-semibold text-primary">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-secondary">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
