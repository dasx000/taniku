import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Sun } from "lucide-react";

export function WeatherIcon({
  deskripsi,
  className = "h-9 w-9 text-weather",
}: {
  deskripsi: string;
  className?: string;
}) {
  const d = deskripsi.toLowerCase();
  const props = { className, strokeWidth: 2 as const };

  if (d.includes("petir")) return <CloudLightning {...props} />;
  if (d.includes("hujan")) return <CloudRain {...props} />;
  if (d.includes("kabut") || d.includes("asap")) return <CloudFog {...props} />;
  if (d.includes("cerah berawan")) return <CloudSun {...props} />;
  if (d.includes("berawan")) return <Cloud {...props} />;
  if (d.includes("cerah")) return <Sun {...props} />;
  return <CloudSun {...props} />;
}
