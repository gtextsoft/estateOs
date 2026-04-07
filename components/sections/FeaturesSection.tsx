import { Shield, QrCode, Users, AlertTriangle, CreditCard, Bell, BarChart3, Lock } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Visitor Access",
    description: "Residents generate secure QR passes. Guards scan in under 3 seconds. Every entry logged automatically.",
  },
  {
    icon: Shield,
    title: "Security Command Center",
    description: "Real-time gate activity, live traffic heatmaps, and instant incident alerts for your security team.",
  },
  {
    icon: Users,
    title: "Resident Management",
    description: "Onboard residents, assign units, manage documents, and maintain a complete estate directory.",
  },
  {
    icon: AlertTriangle,
    title: "Incident Reporting",
    description: "Log incidents with photos and voice notes. Track resolution status from report to completion.",
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Track service charges, send automated reminders, and maintain transparent financial records.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Visitor arrivals, payment reminders, security alerts — delivered instantly to the right people.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Visitor patterns, incident trends, payment summaries — data-driven estate intelligence.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "AES-256 encryption, role-based access, audit logs, and automatic data purging for compliance.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-cream">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything Your Estate Needs
          </h2>
          <p className="text-muted-foreground text-lg">
            A modular platform designed to grow with your community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300 border border-border hover:border-primary/20"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-gold group-hover:shadow-gold transition-all duration-300">
                <feature.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

