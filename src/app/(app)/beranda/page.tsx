import Link from "next/link";
import {
  Bell,
  Bug,
  Calculator,
  CalendarDays,
  CloudRain,
  CloudSun,
  Droplets,
  FlaskConical,
  Leaf,
  Map,
  MapPin,
  Sprout,
  Stethoscope,
  Tractor,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { ROLE_LABEL, getGreeting, getInitials } from "@/lib/profile";

type Feature = {
  href: string;
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
};

const FEATURES: Feature[] = [
  { href: "/lahan", label: "Lahan Saya", icon: Map, bg: "bg-forest/10", text: "text-forest" },
  { href: "/kalkulator-benih", label: "Kalkulator Benih", icon: Calculator, bg: "bg-forest/10", text: "text-forest" },
  { href: "/kalkulator-pupuk", label: "Kalkulator Pupuk", icon: FlaskConical, bg: "bg-leaf/15", text: "text-leaf" },
  { href: "/cuaca", label: "Cuaca", icon: CloudSun, bg: "bg-weather/15", text: "text-weather" },
  { href: "/hama", label: "Hama", icon: Bug, bg: "bg-danger/12", text: "text-danger" },
  { href: "/gulma", label: "Gulma", icon: Sprout, bg: "bg-warning/12", text: "text-warning" },
  { href: "/penyakit", label: "Penyakit", icon: Stethoscope, bg: "bg-info/12", text: "text-info" },
  { href: "/aut", label: "AUT", icon: Tractor, bg: "bg-weather/15", text: "text-weather" },
  { href: "/jadwal-tanam", label: "Jadwal Tanam", icon: CalendarDays, bg: "bg-warning/15", text: "text-warning" },
];

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

function WeatherStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="h-4 w-4 text-weather" strokeWidth={2} />
      <p className="text-xs font-semibold text-primary">{value}</p>
      <p className="text-[10px] text-secondary">{label}</p>
    </div>
  );
}

export default async function BerandaPage() {
  const profile = await getCurrentProfile();
  const fullName = profile?.full_name ?? "Pengguna";

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

      {/* Weather card */}
      {/* Lokasi masih statis -- nanti diganti nama desa dari data lahan user */}
      <section className="mx-6 rounded-card bg-weather/12 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-secondary">Cuaca Hari Ini</p>
            <p className="mt-1 font-heading text-base font-bold text-primary">
              Cerah Berawan
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-secondary">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              Sukamaju, Jawa Barat
            </p>
          </div>
          <div className="flex flex-col items-end">
            <CloudSun className="h-9 w-9 text-weather" strokeWidth={2} />
            <p className="mt-1 font-heading text-3xl font-bold text-primary">28°C</p>
            <p className="text-xs text-secondary">24° - 32°</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/10 pt-3">
          <WeatherStat icon={Droplets} label="Kelembapan" value="78%" />
          <WeatherStat icon={Wind} label="Angin" value="12 km/j" />
          <WeatherStat icon={CloudRain} label="Peluang Hujan" value="20%" />
        </div>
      </section>

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
        <div className="mt-3 grid grid-cols-3 gap-3">
          {FEATURES.map(({ href, label, icon: Icon, bg, text }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-2 rounded-2xl ${bg} px-2 py-4`}
            >
              <Icon className={`h-8 w-8 ${text}`} strokeWidth={2} />
              <span className="text-center text-sm font-medium leading-tight text-primary">
                {label}
              </span>
            </Link>
          ))}
        </div>
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
