import Link from "next/link";

export default function SupportPage() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">Support</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          For pilots and onboarding, we&apos;ll help set up tenants, roles, and gate policies,
          then validate the guest invitation flow end-to-end.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">Sales & onboarding</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Request a demo, discuss rollout, and define your security workflows.
            </p>
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md bg-gradient-gold shadow-gold hover:opacity-90 transition-opacity px-6 text-sm font-medium text-primary-foreground"
              >
                Request demo
              </Link>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">Security issues</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Report vulnerabilities privately. We&apos;ll triage and respond quickly.
            </p>
            <div className="mt-4">
              <a
                href="mailto:security@estateos.example"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium hover:bg-muted transition-colors"
              >
                Email security
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

