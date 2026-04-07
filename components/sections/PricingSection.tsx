import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$99",
    period: "/estate/month",
    description: "For small gated communities",
    features: ["Up to 50 units", "QR visitor access", "Security dashboard", "Incident reporting", "Email support"],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$249",
    period: "/estate/month",
    description: "For premium estates & towers",
    features: ["Up to 200 units", "Everything in Starter", "Payments & billing", "Analytics & reports", "WhatsApp integration", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For estate portfolios & developers",
    features: ["Unlimited units", "Everything in Professional", "Multi-estate management", "IoT & CCTV integration", "Custom SLA", "Dedicated account manager"],
    highlighted: false,
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-cream">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg">Start with what you need. Scale as you grow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-foreground text-primary-foreground shadow-elevated scale-[1.02]"
                  : "bg-card border border-border shadow-soft hover:shadow-card"
              }`}
            >
              <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? "text-gold-light" : "text-primary"}`}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm mb-8 ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-gold-light" : "text-primary"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={`inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-medium ${
                  plan.highlighted
                    ? "bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

