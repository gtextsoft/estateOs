"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "lucide-react";

import { loginEmailRequest, loginLegacyRequest } from "@/lib/estate-api";
import { isApiMode, setSession } from "@/lib/session";

function routeAfterLogin(input: {
  role: string;
  kycStatus?: string;
  estateStatus?: string;
}) {
  if (input.role === "platform_admin") return "/platform";
  if (input.role === "manager" && input.estateStatus === "pending") return "/pending-estate";
  if (
    (input.role === "resident" || input.role === "guard") &&
    input.kycStatus === "submitted"
  ) {
    return "/pending-kyc";
  }
  if (input.role === "resident") return "/residents";
  if (input.role === "guard") return "/security";
  if (input.role === "manager") return "/dashboard";
  return "/login";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [residentCode, setResidentCode] = useState(
    () => process.env.NEXT_PUBLIC_DEMO_RESIDENT_CODE || "RES-A01",
  );
  const [showLegacy, setShowLegacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode()) {
        setError("NEXT_PUBLIC_API_URL is not set");
        return;
      }
      const res = await loginEmailRequest({ email: email.trim(), password });
      setSession({
        token: res.token,
        userId: res.userId,
        role: res.role,
        residentId: res.residentId,
      });
      document.cookie = `estateos_role=${res.role}; path=/; max-age=${60 * 60 * 24 * 30}`;
      const nextParam =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      const dest =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : routeAfterLogin({
              role: res.role,
              kycStatus: res.kycStatus,
              estateStatus: res.estateStatus,
            });
      router.push(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const legacyResident = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode()) {
        setError("NEXT_PUBLIC_API_URL is not set");
        return;
      }
      const res = await loginLegacyRequest({
        role: "resident",
        residentCode: residentCode.trim(),
      });
      setSession({
        token: res.token,
        userId: res.userId,
        role: res.role,
        residentId: res.userId,
      });
      document.cookie = `estateos_role=resident; path=/; max-age=${60 * 60 * 24 * 30}`;
      router.push("/residents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex overflow-hidden">
      <div className="hidden lg:flex flex-1 relative">
        <Image
          src="/assets/hero-estate.jpg"
          alt="Luxury estate"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="absolute inset-0 p-12 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Image src="/assets/logo.png" alt="EstateOS" width={32} height={32} />
            <span className="font-display text-2xl font-semibold text-primary-foreground">
              Estate<span className="text-gradient-gold">OS</span>
            </span>
          </div>
          <div className="max-w-md">
            <p className="text-sm font-semibold text-gold-light uppercase tracking-wider mb-3">
              Secure smart estate operating system
            </p>
            <h1 className="font-display text-4xl font-bold text-primary-foreground leading-tight">
              Sign in with your account.
            </h1>
            <p className="mt-4 text-primary-foreground/80 text-lg leading-relaxed">
              Email and password for residents, guards, managers, and platform admins.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[480px] bg-card border-l border-border flex flex-col justify-center px-6 py-14 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Sign in</p>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-6">
            New here?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>{" "}
            ·{" "}
            <Link href="/register-estate" className="text-primary font-medium hover:underline">
              Register an estate
            </Link>
          </p>

          {isApiMode() && (
            <form onSubmit={(e) => void emailLogin(e)} className="space-y-4 mb-6">
              <p className="text-xs text-muted-foreground">
                API: <span className="font-mono text-foreground">{process.env.NEXT_PUBLIC_API_URL}</span>
              </p>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <p className="text-xs text-center text-muted-foreground">
                Platform admin: sign in below, then you&apos;ll be redirected to{" "}
                <Link href="/platform" className="text-primary hover:underline">
                  /platform
                </Link>{" "}
                automatically.
              </p>
              <details className="text-xs text-muted-foreground rounded-lg border border-border bg-muted/20 p-3">
                <summary className="cursor-pointer font-medium text-foreground">Local demo passwords (after npm run seed)</summary>
                <ul className="mt-2 space-y-1.5 list-disc pl-4 font-mono">
                  <li>platform@estateos.local / PlatformAdmin123!</li>
                  <li>manager@estateos.local / Manager123!</li>
                  <li>guard@estateos.local / Guard123!</li>
                  <li>adaeze@estateos.io / Resident123!</li>
                </ul>
              </details>
            </form>
          )}

          {isApiMode() && (
            <div className="border-t border-border pt-6">
              <button
                type="button"
                onClick={() => setShowLegacy((s) => !s)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {showLegacy ? "Hide" : "Show"} legacy demo login (resident code)
              </button>
              {showLegacy && (
                <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Resident-only: JWT uses resident id as sub (no User row). Use email login for guard/manager
                    (seed accounts).
                  </p>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">
                    Resident code
                  </label>
                  <input
                    value={residentCode}
                    onChange={(e) => setResidentCode(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono outline-none"
                    placeholder="RES-A01"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void legacyResident()}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-border p-2 text-sm hover:bg-muted/50"
                  >
                    <User className="h-4 w-4" />
                    Sign in with code
                  </button>
                </div>
              )}
            </div>
          )}

          {!isApiMode() && (
            <p className="text-sm text-muted-foreground mb-4">
              Set <code className="text-xs">NEXT_PUBLIC_API_URL</code> for API login, or use offline demo from the
              home page.
            </p>
          )}

          <p className="mt-8 text-xs text-muted-foreground">
            By continuing you agree to the <a className="hover:underline" href="/terms">Terms</a> and{" "}
            <a className="hover:underline" href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
