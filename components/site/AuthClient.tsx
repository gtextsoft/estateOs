"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, User } from "lucide-react";

import {
  AuthSplitPage,
  type SignInFormProps,
  type SignUpFormProps,
  type Testimonial,
} from "@/components/ui/sign-in";
import { Modal } from "@/components/ui/modal";
import { NoticeModal } from "@/components/ui/NoticeModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  confirmVerificationCode,
  loginEmailRequest,
  loginLegacyRequest,
  requestVerificationCode,
  resolveEstateSlug,
  signupRequest,
  requestPasswordReset,
  confirmPasswordReset,
  meRequest,
} from "@/lib/estate-api";
import { userMustResetPassword } from "@/lib/must-reset-password";
import { resolvePostLoginPath } from "@/lib/auth-routing";
import { isApiMode, setSession } from "@/lib/session";
import { useMessageModals } from "@/lib/use-message-modals";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80";

const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity.",
  },
];

const MUST_RESET_PROMPT =
  "Your account was created by an admin. Set a new password before you can use EstateOS.";

export function AuthClient() {
  const router = useRouter();
  const pathname = usePathname();
  const mode = pathname === "/signup" ? "signup" : "signin";

  const setMode = (m: "signin" | "signup") => {
    router.push(m === "signup" ? "/signup" : "/login");
  };

  useEffect(() => {
    setError(null);
  }, [pathname]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [residentCode, setResidentCode] = useState(
    () => process.env.NEXT_PUBLIC_DEMO_RESIDENT_CODE || "RES-A01",
  );
  const [showLegacy, setShowLegacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState<"resident" | "guard">("resident");
  const [estateSlug, setEstateSlug] = useState("demo-estate");
  const [estateName, setEstateName] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("");
  const [block, setBlock] = useState("");
  const [notes, setNotes] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationInlineCode, setVerificationInlineCode] = useState<string | null>(null);
  const legacyAuthEnabled = process.env.NEXT_PUBLIC_ALLOW_LEGACY_AUTH === "true";
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetDevCode, setResetDevCode] = useState<string | null>(null);
  const [mustResetPrompt, setMustResetPrompt] = useState<string | null>(null);
  const [forceMustReset, setForceMustReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const { noticeModal, enqueueNotice, dismissNotice } = useMessageModals();

  const openForcedPasswordReset = (accountEmail?: string) => {
    setForceMustReset(true);
    setMustResetPrompt(MUST_RESET_PROMPT);
    setResetOpen(true);
    if (accountEmail) setResetEmail(accountEmail);
    setResetCode("");
    setResetPassword("");
    setResetDevCode(null);
    setResetError(null);
    setMode("signin");
  };

  useEffect(() => {
    if (!isApiMode() || mode !== "signin") return;
    const mustResetFromUrl =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("mustReset") === "1";
    void (async () => {
      try {
        const session = await meRequest();
        if (userMustResetPassword(session.user) || mustResetFromUrl) {
          openForcedPasswordReset(session.user.email);
        }
      } catch {
        if (mustResetFromUrl) {
          setMustResetPrompt(MUST_RESET_PROMPT);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-check when returning to sign-in
  }, [mode, pathname]);

  const emailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode()) {
        setError("NEXT_PUBLIC_API_URL is not set");
        return;
      }
      const fd = new FormData(e.currentTarget);
      const em = String(fd.get("email") ?? email).trim();
      const pw = String(fd.get("password") ?? password);
      const res = await loginEmailRequest({ email: em, password: pw });
      if (res.mustResetPassword) {
        openForcedPasswordReset(em);
        return;
      }
      setSession({
        userId: res.userId,
        role: res.role,
        residentId: res.residentId,
      });
      document.cookie = `estateos_role=${res.role}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      const nextParam =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      const dest = resolvePostLoginPath({
        role: res.role,
        kycStatus: res.kycStatus,
        estateStatus: res.estateStatus,
        next: nextParam,
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

  const checkSlug = async () => {
    setError(null);
    try {
      const r = await resolveEstateSlug(estateSlug.trim());
      setEstateName(r.estate.name);
    } catch {
      setEstateName(null);
      setError("Estate not found or not active. Check the slug with your manager.");
    }
  };

  const submitSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isApiMode()) {
        setError("NEXT_PUBLIC_API_URL is not set");
        return;
      }
      if (!verificationToken) {
        setError("Verify your email with the code before creating an account.");
        return;
      }
      const res = await signupRequest({
        role,
        estateSlug: estateSlug.trim(),
        email: email.trim(),
        password,
        name: fullName.trim(),
        unit: unit.trim(),
        building: building.trim() || undefined,
        block: block.trim() || undefined,
        phone: phone.trim() || undefined,
        kyc: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          notes: notes.trim() || undefined,
        },
        verificationToken,
      });
      setSession({
        userId: res.userId,
        role: res.role,
        residentId: res.residentId,
      });
      document.cookie = `estateos_role=${res.role}; path=/; max-age=${60 * 60 * 24 * 30}`;
      router.push("/pending-kyc");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const requestSignupVerification = async () => {
    setError(null);
    if (!isApiMode()) {
      setError("NEXT_PUBLIC_API_URL is not set");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setVerificationBusy(true);
    try {
      const out = await requestVerificationCode({ email: email.trim(), intent: "signup" });
      setVerificationRequested(true);
      setVerificationToken(null);
      setVerificationInlineCode(out.devCode ?? null);
      enqueueNotice("Verification code sent", out.message ?? "Verification code sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setVerificationBusy(false);
    }
  };

  const confirmSignupVerification = async () => {
    setError(null);
    if (!email.trim() || !verificationCode.trim()) {
      setError("Enter both email and verification code.");
      return;
    }
    setVerificationBusy(true);
    try {
      const res = await confirmVerificationCode({
        email: email.trim(),
        intent: "signup",
        code: verificationCode.trim(),
      });
      setVerificationToken(res.verificationToken);
      setVerificationInlineCode(null);
      enqueueNotice("Email verified", res.message ?? "Email verified successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setVerificationBusy(false);
    }
  };

  const signInProps: SignInFormProps = {
    title: (
      <span className="font-display font-light tracking-tighter text-foreground">
        Welcome to Estate<span className="text-gradient-gold">OS</span>
      </span>
    ),
    description: "Secure sign-in for residents, security, managers, and platform admins.",
    onSignIn: (e) => void emailLogin(e),
    onGoogleSignIn: () => {
      enqueueNotice("Google sign-in unavailable", "Google sign-in is not configured yet.");
    },
    onResetPassword: () => {
      if (!isApiMode()) {
        setError("Set NEXT_PUBLIC_API_URL to use password reset.");
        return;
      }
      setResetOpen(true);
      setForceMustReset(false);
      setResetEmail(email);
      setResetCode("");
      setResetPassword("");
      setResetDevCode(null);
      setResetError(null);
      setMustResetPrompt(null);
      setError(null);
    },
    onCreateAccount: () => setMode("signup"),
    error: mode === "signin" ? error : null,
    loading: loading && mode === "signin",
    signInFooterExtra: (
      <div className="animate-element animate-delay-1000 space-y-4">
        {mustResetPrompt && (
          <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
            {mustResetPrompt}
          </p>
        )}
        {/* {isApiMode() && (
          <p className="text-center text-xs text-muted-foreground">
            API:{" "}
            <span className="font-mono text-[0.7rem] text-foreground">
              {process.env.NEXT_PUBLIC_API_URL}
            </span>
          </p>
        )} */}

        {/* {isApiMode() && (
          <details className="rounded-2xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              Local demo passwords (after npm run seed)
            </summary>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 font-mono">
              <li>platform@estateos.local / PlatformAdmin123!</li>
              <li>manager@estateos.local / Manager123!</li>
              <li>guard@estateos.local / Guard123!</li>
              <li>adaeze@estateos.io / Resident123!</li>
            </ul>
          </details>
        )} */}

        {isApiMode() && legacyAuthEnabled && (
          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowLegacy((s) => !s)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {showLegacy ? "Hide" : "Show"} legacy demo login (resident code)
            </button>
            {showLegacy && (
              <div className="mt-4 space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  Resident-only: JWT uses resident id as sub (no User row). Use email login for guard/manager (seed
                  accounts).
                </p>
                <label
                  htmlFor="legacy-resident-code"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Resident code
                </label>
                <input
                  id="legacy-resident-code"
                  value={residentCode}
                  onChange={(e) => setResidentCode(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 font-mono text-sm outline-none"
                  placeholder="RES-A01"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void legacyResident()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border p-3 text-sm hover:bg-muted/50 disabled:opacity-60"
                >
                  <User className="h-4 w-4" />
                  Sign in with code
                </button>
              </div>
            )}
          </div>
        )}

        {!isApiMode() && (
          <p className="text-center text-sm text-muted-foreground">
            Set <code className="text-xs">NEXT_PUBLIC_API_URL</code> for API login.
          </p>
        )}
      </div>
    ),
  };

  const signUpProps: SignUpFormProps = {
    title: (
      <span className="font-display font-light tracking-tighter text-foreground">
        Join an <span className="text-gradient-gold">estate</span>
      </span>
    ),
    description: "Apply with your estate slug. You’ll complete KYC after signup.",
    onSignUp: (e) => void submitSignup(e),
    onGoogleSignUp: () => {
      enqueueNotice("Google sign-up unavailable", "Google sign-up is not configured yet.");
    },
    onSignIn: () => setMode("signin"),
    role,
    onRoleChange: (r) => setRole(r),
    estateSlug,
    onEstateSlugChange: (v) => {
      setEstateSlug(v);
      setEstateName(null);
    },
    estateName,
    onVerifySlug: () => void checkSlug(),
    email,
    onEmailChange: (value) => {
      setEmail(value);
      setVerificationToken(null);
      setVerificationRequested(false);
      setVerificationCode("");
      setVerificationInlineCode(null);
    },
    password,
    onPasswordChange: setPassword,
    fullName,
    onFullNameChange: setFullName,
    phone,
    onPhoneChange: setPhone,
    unit,
    onUnitChange: setUnit,
    building,
    onBuildingChange: setBuilding,
    block,
    onBlockChange: setBlock,
    notes,
    onNotesChange: setNotes,
    verificationCode,
    onVerificationCodeChange: setVerificationCode,
    onRequestVerificationCode: () => void requestSignupVerification(),
    onConfirmVerificationCode: () => void confirmSignupVerification(),
    verificationRequested,
    verificationVerified: Boolean(verificationToken),
    verificationBusy,
    verificationInlineCode,
    error: mode === "signup" ? error : null,
    loading,
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background">
      <div className="site-page-grid" aria-hidden />
      <div className="relative z-10">
        <AuthSplitPage
          mode={mode}
          onModeChange={setMode}
          heroImageSrc={HERO_IMAGE}
          testimonials={SAMPLE_TESTIMONIALS}
          signInProps={signInProps}
          signUpProps={signUpProps}
        />
      </div>
      <Modal
        isOpen={resetOpen}
        onClose={() => {
          if (loading || forceMustReset) return;
          setResetOpen(false);
          setResetError(null);
        }}
        title={forceMustReset ? "Password reset required" : "Reset password"}
      >
        <div className="space-y-4">
          {resetError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {resetError}
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="text-sm font-medium text-muted-foreground">
              Account email
            </label>
            <Input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={loading || !resetEmail.trim()}
              onClick={() => {
                void (async () => {
                  setResetError(null);
                  setLoading(true);
                  try {
                    const r = await requestPasswordReset(resetEmail.trim());
                    setResetDevCode(r.devCode ?? null);
                    enqueueNotice("Reset code sent", r.message ?? "If that email exists, a reset code was sent.");
                  } catch (err) {
                    setResetError(err instanceof Error ? err.message : "Could not send reset code");
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
            >
              Send code
            </Button>
          </div>
          {resetDevCode && (
            <p className="text-xs text-muted-foreground font-mono">Dev code: {resetDevCode}</p>
          )}
          <div className="space-y-1.5">
            <label htmlFor="reset-code" className="text-sm font-medium text-muted-foreground">
              Verification code
            </label>
            <Input
              id="reset-code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="reset-password" className="text-sm font-medium text-muted-foreground">
              New password
            </label>
            <div className="relative">
            <Input
              id="reset-password"
              type={showResetPassword ? "text" : "password"}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowResetPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center"
              aria-label={showResetPassword ? "Hide password" : "Show password"}
            >
              {showResetPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
              )}
            </button>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-gold shadow-gold hover:opacity-90"
            disabled={loading || !resetEmail || !resetCode || resetPassword.length < 8}
            onClick={() => {
              void (async () => {
                setResetError(null);
                setLoading(true);
                try {
                  const out = await confirmPasswordReset({
                    email: resetEmail.trim(),
                    code: resetCode.trim(),
                    password: resetPassword,
                  });
                  setResetOpen(false);
                  setResetError(null);
                  setMustResetPrompt(null);
                  setForceMustReset(false);
                  router.replace("/login");
                  enqueueNotice("Password updated", out.message ?? "Sign in with your new password.");
                } catch (err) {
                  setResetError(err instanceof Error ? err.message : "Reset failed");
                } finally {
                  setLoading(false);
                }
              })();
            }}
          >
            Update password
          </Button>
        </div>
      </Modal>
      <NoticeModal notice={noticeModal} onClose={dismissNotice} confirmLabel="Okay" />
    </div>
  );
}
