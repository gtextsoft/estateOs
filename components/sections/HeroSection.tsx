import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield, QrCode, Bell } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Security-First Estate Management
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            The Operating System for{" "}
            <span className="text-gradient-gold">Luxury Estates</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Seamless visitor access, real-time security monitoring, and intelligent estate operations all in one elegant platform.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md bg-gradient-gold shadow-gold hover:opacity-90 transition-opacity px-6 text-sm font-medium text-primary-foreground"
            >
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              See How It Works
            </a>
          </div>

          <div className="flex items-center gap-8 pt-4">
            {[
              { icon: QrCode, label: "QR Access" },
              { icon: Shield, label: "24/7 Monitoring" },
              { icon: Bell, label: "Instant Alerts" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative rounded-2xl overflow-hidden shadow-elevated">
            <Image
              src="/assets/hero-estate.jpg"
              alt="EstateOS luxury dashboard"
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-foreground/10 to-transparent" />
          </div>
          <div className="absolute -bottom-4 -left-4 glass-card rounded-xl p-4 shadow-card animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Gate Access</p>
                <p className="text-xs text-muted-foreground">12 visitors today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

