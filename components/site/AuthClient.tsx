"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

import {
  AuthSplitPage,
  type SignInFormProps,
  type SignUpFormProps,
  type Testimonial,
} from "@/components/ui/sign-in";
import { loginEmailRequest, loginLegacyRequest, resolveEstateSlug, signupRequest } from "@/lib/estate-api";
import { isApiMode, setSession } from "@/lib/session";

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
      });
      setSession({
        token: res.token,
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

  const signInProps: SignInFormProps = {
    title: (
      <span className="font-display font-light tracking-tighter text-foreground">
        Welcome to Estate<span className="text-gradient-gold">OS</span>
      </span>
    ),
    description: "Secure sign-in for residents, security, managers, and platform admins.",
    onSignIn: (e) => void emailLogin(e),
    onGoogleSignIn: () => {
      window.alert("Google sign-in is not configured yet.");
    },
    onResetPassword: () => {
      window.alert("Contact your estate manager or use the support page for account recovery.");
    },
    onCreateAccount: () => setMode("signup"),
    error: mode === "signin" ? error : null,
    loading: loading && mode === "signin",
    signInFooterExtra: (
      <div className="animate-element animate-delay-1000 space-y-4">
        {isApiMode() && (
          <p className="text-center text-xs text-muted-foreground">
            API:{" "}
            <span className="font-mono text-[0.7rem] text-foreground">
              {process.env.NEXT_PUBLIC_API_URL}
            </span>
          </p>
        )}

        {isApiMode() && (
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
        )}

        {isApiMode() && (
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
                <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Resident code
                </label>
                <input
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
      window.alert("Google sign-up is not configured yet.");
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
    onEmailChange: setEmail,
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
    </div>
  );
}
