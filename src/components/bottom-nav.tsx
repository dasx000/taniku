"use client";

import { useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Home, Newspaper, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LoadingOverlay } from "@/components/loading-overlay";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/beranda", label: "Beranda", icon: Home },
  { href: "/informasi", label: "Informasi", icon: Newspaper },
  { href: "/notifikasi", label: "Notifikasi", icon: Bell, badge: 1 },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (href === pathname) return;
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-card">
      <div className="mx-auto flex max-w-[430px] items-stretch justify-between px-4 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleClick(e, href)}
              className="flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-xl py-1.5"
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <Icon
                  className={`h-6 w-6 ${active ? "text-forest" : "text-secondary"}`}
                  strokeWidth={active ? 2.25 : 2}
                />
                {badge ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
                    {badge}
                  </span>
                ) : null}
              </span>
              <span
                className={`text-[11px] ${
                  active ? "font-semibold text-forest" : "font-medium text-secondary"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <LoadingOverlay active={pending} />
    </nav>
  );
}
