import type { LucideIcon } from "lucide-react";

export function WeatherStat({
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
