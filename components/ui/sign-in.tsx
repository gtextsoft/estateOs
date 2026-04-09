"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

// --- ICONS ---

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
    />
  </svg>
);

// --- TYPES ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInFormProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  signInFooterExtra?: React.ReactNode;
  error?: string | null;
  loading?: boolean;
}

export interface SignUpFormProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onSignIn?: () => void;
  registerEstateHref?: string;
  role: "resident" | "guard";
  onRoleChange: (r: "resident" | "guard") => void;
  estateSlug: string;
  onEstateSlugChange: (v: string) => void;
  estateName: string | null;
  onVerifySlug: () => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  fullName: string;
  onFullNameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  unit: string;
  onUnitChange: (v: string) => void;
  building: string;
  onBuildingChange: (v: string) => void;
  block: string;
  onBlockChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  error?: string | null;
  loading?: boolean;
}

export interface SignInPageProps extends SignInFormProps {
  heroImageSrc?: string;
  testimonials?: Testimonial[];
}

export interface SignUpPageProps extends SignUpFormProps {
  heroImageSrc?: string;
  testimonials?: Testimonial[];
}

export interface AuthSplitPageProps {
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  signInProps: SignInFormProps;
  signUpProps: SignUpFormProps;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/50 focus-within:bg-primary/5">
    {children}
  </div>
);

const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={cn(
      "animate-testimonial flex w-64 items-start gap-3 rounded-3xl border border-white/10 bg-card/40 p-5 backdrop-blur-xl dark:bg-zinc-800/40",
      delay,
    )}
  >
    <Image
      src={testimonial.avatarSrc}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 rounded-2xl object-cover"
    />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

function HeroColumn({
  heroImageSrc,
  testimonials = [],
}: {
  heroImageSrc: string;
  testimonials?: Testimonial[];
}) {
  return (
    <section className="relative hidden flex-1 p-4 md:block">
      <div
        className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageSrc})` }}
      />
      {testimonials.length > 0 && (
        <div className="absolute bottom-8 left-1/2 flex w-full -translate-x-1/2 justify-center gap-4 px-8">
          <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
          {testimonials[1] && (
            <div className="hidden xl:flex">
              <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
            </div>
          )}
          {testimonials[2] && (
            <div className="hidden 2xl:flex">
              <TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "signin" | "signup";
  onChange: (m: "signin" | "signup") => void;
}) {
  return (
    <div
      className="animate-element animate-delay-100 mb-8 flex rounded-2xl border border-border bg-muted/40 p-1"
      role="tablist"
      aria-label="Authentication mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signin"}
        onClick={() => onChange("signin")}
        className={cn(
          "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
          mode === "signin"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Sign in
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signup"}
        onClick={() => onChange("signup")}
        className={cn(
          "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
          mode === "signup"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Create account
      </button>
    </div>
  );
}

export function SignInFormInner({
  title = <span className="font-light tracking-tighter text-foreground">Welcome</span>,
  description = "Access your account and continue your journey with us",
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  signInFooterExtra,
  error,
  loading = false,
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="animate-element animate-delay-100 text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl">{title}</h1>
      <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

      <form className="space-y-5" onSubmit={onSignIn}>
        <div className="animate-element animate-delay-300">
          <label className="text-sm font-medium text-muted-foreground">Email Address</label>
          <GlassInputWrapper>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-400">
          <label className="text-sm font-medium text-muted-foreground">Password</label>
          <GlassInputWrapper>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-2xl bg-transparent p-4 pr-12 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                )}
              </button>
            </div>
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-500 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="rememberMe" className="custom-checkbox" />
            <span className="text-foreground/90">Keep me signed in</span>
          </label>
          <button
            type="button"
            onClick={() => onResetPassword?.()}
            className="text-primary transition-colors hover:underline"
          >
            Reset password
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="animate-element animate-delay-700 relative flex items-center justify-center">
        <span className="w-full border-t border-border" />
        <span className="absolute bg-background px-4 text-sm text-muted-foreground">Or continue with</span>
      </div>

      <button
        type="button"
        onClick={onGoogleSignIn}
        className="animate-element animate-delay-800 flex w-full items-center justify-center gap-3 rounded-2xl border border-border py-4 transition-colors hover:bg-secondary"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
        New to our platform?{" "}
        <button
          type="button"
          onClick={() => onCreateAccount?.()}
          className="text-primary transition-colors hover:underline"
        >
          Create Account
        </button>
      </p>

      {signInFooterExtra}

      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to the{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export function SignUpFormInner({
  title = <span className="font-light tracking-tighter text-foreground">Join your estate</span>,
  description = "Create an account to access resident or security features after verification.",
  onSignUp,
  onGoogleSignUp,
  onSignIn,
  registerEstateHref = "/register-estate",
  role,
  onRoleChange,
  estateSlug,
  onEstateSlugChange,
  estateName,
  onVerifySlug,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  fullName,
  onFullNameChange,
  phone,
  onPhoneChange,
  unit,
  onUnitChange,
  building,
  onBuildingChange,
  block,
  onBlockChange,
  notes,
  onNotesChange,
  error,
  loading,
}: SignUpFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="animate-element animate-delay-100 text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl">{title}</h1>
      <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

      <form className="space-y-4" onSubmit={onSignUp}>
        <div className="animate-element animate-delay-300 flex gap-2">
          <button
            type="button"
            onClick={() => onRoleChange("resident")}
            className={cn(
              "flex-1 rounded-2xl border py-2.5 text-sm font-medium transition-colors",
              role === "resident" ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50",
            )}
          >
            Resident
          </button>
          <button
            type="button"
            onClick={() => onRoleChange("guard")}
            className={cn(
              "flex-1 rounded-2xl border py-2.5 text-sm font-medium transition-colors",
              role === "guard" ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50",
            )}
          >
            Security
          </button>
        </div>

        <div className="animate-element animate-delay-300">
          <label className="text-sm font-medium text-muted-foreground">Estate slug</label>
          <div className="mt-1 flex gap-2">
            <GlassInputWrapper>
              <input
                name="estateSlug"
                value={estateSlug}
                onChange={(e) => onEstateSlugChange(e.target.value)}
                className="w-full rounded-2xl bg-transparent p-3.5 text-sm focus:outline-none"
                placeholder="e.g. demo-estate"
                required
              />
            </GlassInputWrapper>
            <button
              type="button"
              onClick={onVerifySlug}
              className="shrink-0 rounded-2xl border border-border px-4 text-xs font-semibold transition-colors hover:bg-muted/50"
            >
              Verify
            </button>
          </div>
          {estateName && <p className="mt-1 text-xs text-emerald-600">Found: {estateName}</p>}
        </div>

        <div className="animate-element animate-delay-400">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <GlassInputWrapper>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-400">
          <label className="text-sm font-medium text-muted-foreground">Password</label>
          <GlassInputWrapper>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
              placeholder="Create a password"
              required
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-500">
          <label className="text-sm font-medium text-muted-foreground">Full legal name</label>
          <GlassInputWrapper>
            <input
              name="fullName"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
              required
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-500">
          <label className="text-sm font-medium text-muted-foreground">Phone</label>
          <GlassInputWrapper>
            <input
              name="phone"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
              placeholder="Optional"
            />
          </GlassInputWrapper>
        </div>

        {role === "resident" && (
          <>
            <div className="animate-element animate-delay-500">
              <label className="text-sm font-medium text-muted-foreground">Unit</label>
              <GlassInputWrapper>
                <input
                  name="unit"
                  value={unit}
                  onChange={(e) => onUnitChange(e.target.value)}
                  className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
                  placeholder="e.g. A-01"
                  required={role === "resident"}
                />
              </GlassInputWrapper>
            </div>
            <div className="animate-element animate-delay-500 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Building</label>
                <GlassInputWrapper>
                  <input
                    name="building"
                    value={building}
                    onChange={(e) => onBuildingChange(e.target.value)}
                    className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
                    placeholder="Optional"
                  />
                </GlassInputWrapper>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Block</label>
                <GlassInputWrapper>
                  <input
                    name="block"
                    value={block}
                    onChange={(e) => onBlockChange(e.target.value)}
                    className="w-full rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
                    placeholder="Optional"
                  />
                </GlassInputWrapper>
              </div>
            </div>
          </>
        )}

        <div className="animate-element animate-delay-600">
          <label className="text-sm font-medium text-muted-foreground">Notes for estate manager</label>
          <GlassInputWrapper>
            <textarea
              name="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="min-h-[88px] w-full resize-y rounded-2xl bg-transparent p-4 text-sm focus:outline-none"
              placeholder="Optional"
            />
          </GlassInputWrapper>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="animate-element animate-delay-700 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit application"}
        </button>
      </form>

      <div className="animate-element animate-delay-700 relative flex items-center justify-center">
        <span className="w-full border-t border-border" />
        <span className="absolute bg-background px-4 text-sm text-muted-foreground">Or continue with</span>
      </div>

      <button
        type="button"
        onClick={onGoogleSignUp}
        className="animate-element animate-delay-800 flex w-full items-center justify-center gap-3 rounded-2xl border border-border py-4 transition-colors hover:bg-secondary"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={() => onSignIn?.()} className="text-primary transition-colors hover:underline">
          Sign in
        </button>
        {" · "}
        <Link href={registerEstateHref} className="text-primary transition-colors hover:underline">
          Register an estate
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to the{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function AuthSplitShell({
  leftColumn,
  heroImageSrc,
  testimonials,
}: {
  leftColumn: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
}) {
  return (
    <div className="flex min-h-dvh w-full flex-col font-sans md:flex-row">
      <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:p-8">
        <div className="w-full max-w-md">{leftColumn}</div>
      </section>
      {heroImageSrc ? <HeroColumn heroImageSrc={heroImageSrc} testimonials={testimonials} /> : null}
    </div>
  );
}

/** Standalone sign-in page (hero + form). */
export function SignInPage({ heroImageSrc, testimonials, ...form }: SignInPageProps) {
  return (
    <AuthSplitShell
      heroImageSrc={heroImageSrc}
      testimonials={testimonials}
      leftColumn={<SignInFormInner {...form} />}
    />
  );
}

/** Standalone sign-up page (hero + form). */
export function SignUpPage({ heroImageSrc, testimonials, ...form }: SignUpPageProps) {
  return (
    <AuthSplitShell
      heroImageSrc={heroImageSrc}
      testimonials={testimonials}
      leftColumn={<SignUpFormInner {...form} />}
    />
  );
}

/** Toggle between sign-in and sign-up on one layout (use with router for URL sync). */
export function AuthSplitPage({
  mode,
  onModeChange,
  heroImageSrc,
  testimonials,
  signInProps,
  signUpProps,
}: AuthSplitPageProps) {
  return (
    <AuthSplitShell
      heroImageSrc={heroImageSrc}
      testimonials={testimonials}
      leftColumn={
        <>
          <ModeToggle mode={mode} onChange={onModeChange} />
          {mode === "signin" ? <SignInFormInner {...signInProps} /> : <SignUpFormInner {...signUpProps} />}
        </>
      }
    />
  );
}
