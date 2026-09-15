"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, User, Sprout } from "lucide-react";
import { BrandMark, BrandWordmark } from "@/components/brand-mark";
import { Spinner } from "@/components/spinner";
import { createClient } from "@/lib/supabase/client";

const GENERIC_ERROR = "Nomor HP / Email atau password salah.";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const trimmed = identifier.trim();

    try {
      let email = trimmed;

      if (!trimmed.includes("@")) {
        const { data: resolvedEmail, error: resolveError } = await supabase.rpc(
          "resolve_login_email",
          { p_identifier: trimmed },
        );

        if (resolveError || !resolvedEmail) {
          setError(GENERIC_ERROR);
          setLoading(false);
          return;
        }

        email = resolvedEmail as string;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError(GENERIC_ERROR);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      router.push(profile?.role === "admin" ? "/admin" : "/beranda");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 pb-6 pt-14">
      <div className="flex flex-1 flex-col">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <BrandMark />
          <BrandWordmark />
        </div>

        {/* Heading */}
        <div className="mt-8 text-center">
          <h1 className="font-heading text-xl font-semibold text-primary">
            Selamat Datang di TaniKu
          </h1>
          <p className="mt-1.5 text-sm text-secondary">Masuk untuk melanjutkan</p>
        </div>

        {/* Form */}
        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="Nomor HP / Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="h-12 w-full rounded-input border border-black/10 bg-card pl-11 pr-4 text-[15px] text-primary placeholder:text-secondary/70 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-input border border-black/10 bg-card pl-11 pr-11 text-[15px] text-primary placeholder:text-secondary/70 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-secondary"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded accent-forest"
              />
              Ingat saya
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-forest">
              Lupa password?
            </Link>
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-button bg-forest text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(22,131,75,0.5)] transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Spinner className="h-4 w-4" /> : null}
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs text-secondary">atau</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-secondary">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-forest">
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Aksen bawah: sprout kecil bernapas pelan, bukan ilustrasi */}
      <div className="flex flex-col items-center pb-2 pt-10">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute h-10 w-10 rounded-full bg-leaf/25 animate-pulse-soft" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-leaf/15">
            <Sprout className="h-5 w-5 text-leaf animate-sway" strokeWidth={2} />
          </span>
        </div>
      </div>
    </main>
  );
}
