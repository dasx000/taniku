import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CloudRain, CloudSun, Droplets, MapPin, Wind } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { getWeatherByKodeWilayah } from "@/lib/bmkg";
import { WeatherIcon } from "@/components/weather-icon";
import { WeatherStat } from "@/components/weather-stat";
import { ForecastList } from "@/components/cuaca/forecast-list";

export default async function CuacaPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const weather = profile.kode_wilayah
    ? await getWeatherByKodeWilayah(profile.kode_wilayah)
    : null;

  return (
    <div className="flex flex-col gap-6 pt-6">
      <header className="flex items-center gap-3 px-6">
        <Link
          href="/beranda"
          aria-label="Kembali ke Beranda"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-primary"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h1 className="font-heading text-lg font-bold text-primary">Cuaca</h1>
      </header>

      {weather ? (
        <>
          <section className="mx-6 flex flex-col items-center rounded-card bg-weather/12 p-6 text-center">
            <p className="flex items-center gap-1 text-xs text-secondary">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              {weather.lokasiText}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <WeatherIcon deskripsi={weather.current.deskripsi} className="h-12 w-12 text-weather" />
              <p className="font-heading text-4xl font-bold text-primary">
                {weather.current.suhu}°C
              </p>
            </div>
            <p className="mt-1 text-sm font-medium text-primary">{weather.current.deskripsi}</p>

            <div className="mt-5 grid w-full grid-cols-3 gap-2 border-t border-black/10 pt-4">
              <WeatherStat icon={Droplets} label="Kelembapan" value={`${weather.current.kelembapan}%`} />
              <WeatherStat icon={Wind} label="Angin" value={`${weather.current.anginKmj} km/j`} />
              <WeatherStat
                icon={CloudRain}
                label="Curah Hujan"
                value={`${weather.current.curahHujanMm} mm`}
              />
            </div>
          </section>

          <section>
            <h2 className="px-6 font-heading text-base font-bold text-primary">
              Prakiraan {weather.harian.length} Hari ke Depan
            </h2>
            <p className="px-6 text-xs text-secondary">
              Data resmi BMKG cuma tersedia {weather.harian.length} hari ke depan.
            </p>
            <div className="mt-3">
              <ForecastList harian={weather.harian} />
            </div>
          </section>
        </>
      ) : (
        <div className="mx-6 flex flex-col items-center gap-3 rounded-card bg-card py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-weather/15">
            <CloudSun className="h-6 w-6 text-weather" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">Cuaca belum tersedia</p>
            <p className="mx-auto mt-1 max-w-[240px] text-xs text-secondary">
              Lengkapi domisili di profil untuk melihat prakiraan cuaca lokasi Anda.
            </p>
          </div>
          <Link
            href="/profil/edit"
            className="flex h-11 items-center gap-2 rounded-button bg-forest px-5 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Atur Domisili
          </Link>
        </div>
      )}
    </div>
  );
}
