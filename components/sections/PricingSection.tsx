import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as PricingCard from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";

type PlanVariant = "default" | "outline" | "secondary";

const plans: Array<{
  name: string;
  description: string;
  icon: ReactNode;
  price: string;
  period?: string;
  original?: string;
  badge?: string;
  variant: PlanVariant;
  href: string;
  cta: string;
  features: string[];
}> = [
  {
    name: "Starter",
    description: "For small gated communities",
    icon: <Users className="text-primary" />,
    price: "$99",
    period: "/estate/month",
    variant: "outline",
    href: "/signup",
    cta: "Get started",
    features: [
      "Up to 50 units",
      "QR visitor access",
      "Security dashboard",
      "Incident reporting",
      "Email support",
    ],
  },
  {
    name: "Professional",
    description: "For premium estates & towers",
    icon: <Building2 className="text-primary" />,
    badge: "Popular",
    price: "$249",
    original: "$299",
    period: "/estate/month",
    variant: "default",
    href: "/signup",
    cta: "Get started",
    features: [
      "Up to 200 units",
      "Everything in Starter",
      "Payments & billing",
      "Analytics & reports",
      "WhatsApp integration",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description: "For estate portfolios & developers",
    icon: <Landmark className="text-primary" />,
    price: "Custom",
    variant: "outline",
    href: "/support",
    cta: "Contact sales",
    features: [
      "Unlimited units",
      "Everything in Professional",
      "Multi-estate management",
      "IoT & CCTV integration",
      "Custom SLA",
      "Dedicated account manager",
    ],
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className={cn(
        "relative overflow-x-hidden bg-gradient-cream py-16 sm:py-20 md:py-24",
        "scroll-mt-20",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(hsl(220 20% 14% / 0.06) 0.8px, transparent 0.8px)",
          backgroundSize: "14px 14px",
          maskImage:
            "radial-gradient(circle at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-70 contain-strict lg:block"
      >
        <div className="absolute top-0 left-0 h-[320px] w-[140px] -translate-y-[87.5%] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsl(38_65%_50%_/_0.09)_0,hsl(38_65%_50%_/_0.02)_50%,transparent_80%)]" />
        <div className="absolute top-0 left-0 h-[320px] w-60 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsl(40_60%_70%_/_0.07)_0,hsl(38_65%_50%_/_0.02)_80%,transparent_100%)]" />
        <div className="absolute top-0 left-0 h-[320px] w-60 -translate-y-[87.5%] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsl(38_65%_50%_/_0.05)_0,hsl(220_20%_14%_/_0.02)_80%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto min-w-0 max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="font-display mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            Start with what you need. Scale as your estate grows.
          </p>
        </div>

        <div className="grid min-w-0 justify-center gap-6 sm:max-w-lg sm:mx-auto md:max-w-none md:mx-0 md:grid-cols-3 md:justify-items-center">
          {plans.map((plan) => (
            <PricingCard.Card className="w-full max-w-sm md:min-w-[260px]" key={plan.name}>
              <PricingCard.Header>
                <PricingCard.Plan>
                  <PricingCard.PlanName>
                    {plan.icon}
                    <span className="text-muted-foreground">{plan.name}</span>
                  </PricingCard.PlanName>
                  {plan.badge ? <PricingCard.Badge>{plan.badge}</PricingCard.Badge> : null}
                </PricingCard.Plan>
                <PricingCard.Price>
                  <PricingCard.MainPrice>{plan.price}</PricingCard.MainPrice>
                  {plan.period ? <PricingCard.Period>{plan.period}</PricingCard.Period> : null}
                  {plan.original ? (
                    <PricingCard.OriginalPrice>{plan.original}</PricingCard.OriginalPrice>
                  ) : null}
                </PricingCard.Price>
                <Button variant={plan.variant} className="w-full font-semibold" asChild>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </PricingCard.Header>

              <PricingCard.Body>
                <PricingCard.Description>{plan.description}</PricingCard.Description>
                <PricingCard.List>
                  {plan.features.map((item) => (
                    <PricingCard.ListItem key={item}>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{item}</span>
                    </PricingCard.ListItem>
                  ))}
                </PricingCard.List>
              </PricingCard.Body>
            </PricingCard.Card>
          ))}
        </div>
      </div>
    </section>
  );
}
