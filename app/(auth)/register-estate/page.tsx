"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { confirmVerificationCode, registerEstateRequest, requestVerificationCode } from "@/lib/estate-api";
import { isApiMode, setSession } from "@/lib/session";
import { useMessageModals } from "@/lib/use-message-modals";
import { NoticeModal } from "@/components/ui/NoticeModal";

const labelClass = "block text-sm font-medium text-muted-foreground";
const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function RegisterEstatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [managerName, setManagerName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verificationInlineCode, setVerificationInlineCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { noticeModal, enqueueNotice, dismissNotice } = useMessageModals();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode()) {
        setError("NEXT_PUBLIC_API_URL is not set");
        return;
      }
      if (!verificationToken) {
        setError("Verify your email with the code before submitting.");
        return;
      }
      const res = await registerEstateRequest({
        name: name.trim(),
        slug: slug.trim(),
        email: email.trim(),
        password,
        managerName: managerName.trim() || undefined,
        verificationToken,
      });
      setSession({ userId: res.userId, role: res.role });
      document.cookie = `estateos_role=${res.role}; path=/; max-age=${60 * 60 * 24 * 30}`;
      router.push("/pending-estate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async () => {
    setError(null);
    if (!isApiMode()) {
      setError("NEXT_PUBLIC_API_URL is not set");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email before requesting a verification code.");
      return;
    }
    setLoading(true);
    try {
      const out = await requestVerificationCode({ email: email.trim(), intent: "register-estate" });
      setVerificationRequested(true);
      setVerificationToken(null);
      setVerificationInlineCode(out.devCode ?? null);
      enqueueNotice("Verification code sent", out.message ?? "Verification code sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    if (!email.trim() || !verificationCode.trim()) {
      setError("Enter both email and verification code.");
      return;
    }
    setLoading(true);
    try {
      const res = await confirmVerificationCode({
        email: email.trim(),
        intent: "register-estate",
        code: verificationCode.trim(),
      });
      setVerificationToken(res.verificationToken);
      setVerificationInlineCode(null);
      enqueueNotice("Email verified", res.message ?? "Email verified successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex overflow-hidden">
      <div className="hidden lg:flex flex-1 relative">
        <Image src="/assets/hero-estate.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>
      <div className="w-full lg:w-[520px] bg-card border-l border-border px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Estate manager</p>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Register your estate</h1>
          <p className="text-sm text-muted-foreground mb-6">
            A platform admin must approve your estate before it goes live.{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="estate-name" className={labelClass}>
                Estate / community name
              </label>
              <input
                id="estate-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="organization"
                placeholder="Sunset Hills Estate"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="estate-slug" className={labelClass}>
                URL slug
              </label>
              <input
                id="estate-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                autoComplete="off"
                placeholder="sunset-hills"
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">Used in your estate URL, e.g. sunset-hills</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="manager-name" className={labelClass}>
                Your name <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="manager-name"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                autoComplete="name"
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="work-email" className={labelClass}>
                Work email
              </label>
              <input
                id="work-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setVerificationRequested(false);
                  setVerificationCode("");
                  setVerificationToken(null);
                  setVerificationInlineCode(null);
                }}
                type="email"
                required
                autoComplete="email"
                placeholder="you@estate.com"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={loading}
                className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted/50 disabled:opacity-60"
              >
                {verificationRequested ? "Resend code" : "Send code"}
              </button>
              {verificationToken ? (
                <span className="text-xs text-emerald-600 font-medium">Email verified</span>
              ) : (
                <span className="text-xs text-muted-foreground">Verification required</span>
              )}
            </div>
            {verificationRequested && (
              <div className="space-y-2">
                {verificationInlineCode ? (
                  <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm">
                    <p className="font-medium text-foreground">Your verification code</p>
                    <p className="mt-1 font-mono text-xl tracking-[0.3em]">{verificationInlineCode}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shown here because email delivery is not configured. Use Resend + a verified domain when ready.
                    </p>
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <label htmlFor="verification-code" className={labelClass}>
                    Verification code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="verification-code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      className={inputClass}
                    />
                    <button
                    type="button"
                    onClick={() => void verifyCode()}
                    disabled={loading || Boolean(verificationToken)}
                    className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted/50 disabled:opacity-60"
                  >
                    {verificationToken ? "Verified" : "Verify"}
                  </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="estate-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="estate-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit for review"}
            </button>
          </form>
        </div>
      </div>

      <NoticeModal notice={noticeModal} onClose={dismissNotice} />
    </div>
  );
}
