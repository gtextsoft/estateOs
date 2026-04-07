"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, User, Users } from "lucide-react";

const roles = [
  {
    key: "resident",
    title: "Resident",
    desc: "Invite visitors, get arrival alerts, manage access passes.",
    icon: User,
  },
  {
    key: "guard",
    title: "Security Guard",
    desc: "Scan QR passes, approve/deny entry, log incidents fast.",
    icon: Shield,
  },
  {
    key: "manager",
    title: "Estate Manager",
    desc: "Manage residents, reports, payments, and security oversight.",
    icon: Users,
  },
] as const;

export default function LoginPage() {
  const router = useRouter();

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
              Choose your workspace role.
            </h1>
            <p className="mt-4 text-primary-foreground/80 text-lg leading-relaxed">
              Security-first access control and luxury-grade UX—built for residents, guards, and managers.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[480px] bg-card border-l border-border flex flex-col justify-center px-6 py-14 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Sign in
          </p>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            Select a role
          </h2>
          <p className="text-muted-foreground mb-8">
            This controls your dashboard experience. You can change it later.
          </p>

          <div className="space-y-3">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                className="w-full text-left bg-background rounded-xl border border-border p-4 shadow-soft hover:shadow-card transition-shadow"
                onClick={() => {
                  document.cookie = `estateos_role=${r.key}; path=/; max-age=${60 * 60 * 24 * 30}`;
                  if (r.key === "resident") router.push("/residents");
                  else if (r.key === "guard") router.push("/security");
                  else router.push("/dashboard");
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg font-semibold text-foreground">
                      {r.title}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            By continuing you agree to the <a className="hover:underline" href="/terms">Terms</a> and{" "}
            <a className="hover:underline" href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

