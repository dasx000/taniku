import { Sprout } from "lucide-react";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9" : "h-16 w-16";
  const icon = size === "sm" ? "h-5 w-5" : "h-8 w-8";

  return (
    <div className={`flex ${box} items-center justify-center rounded-full bg-leaf/15`}>
      <Sprout className={`${icon} text-forest`} strokeWidth={2} />
    </div>
  );
}

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <p className={`font-heading text-2xl font-bold tracking-tight ${className}`}>
      <span className="text-forest">Tani</span>
      <span className="text-primary">Ku</span>
    </p>
  );
}
