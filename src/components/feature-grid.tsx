"use client";

import { useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bug,
  Calculator,
  CalendarDays,
  CloudSun,
  FlaskConical,
  Map,
  Sprout,
  Stethoscope,
  Tractor,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { LoadingOverlay } from "@/components/loading-overlay";

type Feature = {
  href: string;
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
};

const FEATURES: Feature[] = [
  { href: "/lahan", label: "Lahan Saya", icon: Map, bg: "bg-forest/10", text: "text-forest" },
  { href: "/tanaman", label: "Tanaman Saya", icon: Wheat, bg: "bg-warning/15", text: "text-warning" },
  { href: "/kalkulator-benih", label: "Kalkulator Benih", icon: Calculator, bg: "bg-forest/10", text: "text-forest" },
  { href: "/kalkulator-pupuk", label: "Kalkulator Pupuk", icon: FlaskConical, bg: "bg-leaf/15", text: "text-leaf" },
  { href: "/cuaca", label: "Cuaca", icon: CloudSun, bg: "bg-weather/15", text: "text-weather" },
  { href: "/hama", label: "Hama", icon: Bug, bg: "bg-danger/12", text: "text-danger" },
  { href: "/gulma", label: "Gulma", icon: Sprout, bg: "bg-warning/12", text: "text-warning" },
  { href: "/penyakit", label: "Penyakit", icon: Stethoscope, bg: "bg-info/12", text: "text-info" },
  { href: "/aut", label: "AUT", icon: Tractor, bg: "bg-weather/15", text: "text-weather" },
  { href: "/jadwal-tanam", label: "Jadwal Tanam", icon: CalendarDays, bg: "bg-warning/15", text: "text-warning" },
];

export function FeatureGrid() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {FEATURES.map(({ href, label, icon: Icon, bg, text }) => (
          <Link
            key={label}
            href={href}
            onClick={(e) => handleClick(e, href)}
            className={`flex flex-col items-center gap-2 rounded-2xl ${bg} px-2 py-4`}
          >
            <Icon className={`h-8 w-8 ${text}`} strokeWidth={2} />
            <span className="text-center text-sm font-medium leading-tight text-primary">
              {label}
            </span>
          </Link>
        ))}
      </div>
      <LoadingOverlay active={pending} />
    </>
  );
}
