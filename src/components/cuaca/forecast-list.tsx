"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { WeatherIcon } from "@/components/weather-icon";
import type { WeatherDay } from "@/lib/bmkg";

export function ForecastList({ harian }: { harian: WeatherDay[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3 px-6">
      {harian.map((day, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={`${day.label}-${index}`}
            className="rounded-card border border-black/5 bg-card p-4"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <WeatherIcon deskripsi={day.deskripsi} className="h-6 w-6 text-weather" />
                <span className="text-sm font-medium text-primary">{day.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-secondary">
                  {day.suhuMin}° - {day.suhuMax}°
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-secondary transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                />
              </div>
            </button>

            {isOpen ? (
              <div className="mt-4 grid grid-cols-3 gap-y-4 border-t border-black/5 pt-4">
                {day.jam.map((h) => (
                  <div key={h.jam} className="flex flex-col items-center gap-1 px-1 text-center">
                    <span className="text-[11px] text-secondary">{h.jam}</span>
                    <WeatherIcon deskripsi={h.deskripsi} className="h-5 w-5 text-weather" />
                    <span className="text-xs font-semibold text-primary">{h.suhu}°</span>
                    <span className="text-[10px] leading-tight text-secondary">{h.deskripsi}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
