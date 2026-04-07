import { UserPlus, QrCode, ScanLine, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Resident Invites Visitor",
    description: "Create a guest pass — single entry, service window, or permanent access.",
  },
  {
    icon: QrCode,
    step: "02",
    title: "QR Code Generated",
    description: "A secure, branded QR pass is sent instantly via WhatsApp or SMS.",
  },
  {
    icon: ScanLine,
    step: "03",
    title: "Security Scans at Gate",
    description: "Guards validate in under 3 seconds. No manual logs, no delays.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Access Granted & Logged",
    description: "Entry recorded with timestamp, photo, and vehicle plate. Resident notified.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From Invite to Entry in Seconds
          </h2>
          <p className="text-muted-foreground text-lg">
            The visitor access flow — the heartbeat of EstateOS.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="relative z-10 mx-auto h-20 w-20 rounded-2xl bg-gradient-gold shadow-gold flex items-center justify-center mb-6">
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="text-xs font-bold text-primary tracking-widest mb-2">STEP {step.step}</p>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

