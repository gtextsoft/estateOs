"use client";

import { UserPlus, QrCode, ScanLine, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Resident invites visitor",
    description:
      "Issue a guest pass for a single visit, a service window, or standing access — with rules that match your estate policy.",
  },
  {
    icon: QrCode,
    step: "02",
    title: "Secure QR delivered instantly",
    description:
      "A branded, time-bound QR pass goes out by WhatsApp or SMS. Residents see status; security sees only what they need.",
  },
  {
    icon: ScanLine,
    step: "03",
    title: "Gate validates in seconds",
    description:
      "Guards scan once. No clipboards, no guesswork — validation, vehicle, and intent in one motion.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Entry logged & everyone aligned",
    description:
      "Timestamp, optional photo, and plate captured. Residents get confirmation; your audit trail stays complete.",
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-gradient-cream py-24 md:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,hsl(38_65%_50%_/_0.07),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,hsl(220_20%_14%_/_0.04),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                How it works
              </div>
              <h2 className="font-display mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
                From invite to entry —{" "}
                <span className="text-gradient-gold">without friction at the gate</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                EstateOS turns visitor access into a single, observable workflow. Fewer disputes, faster
                throughput, and a record you can stand behind.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-card backdrop-blur-sm">
                  <p className="font-display text-2xl font-semibold tabular-nums text-foreground">&lt;3s</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Typical scan time
                  </p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-card backdrop-blur-sm">
                  <p className="font-display text-2xl font-semibold tabular-nums text-foreground">100%</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Digitally logged entries
                  </p>
                </div>
              </div>

              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Built for luxury estates</span>
                <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
              </p>
            </motion.div>
          </div>

          <motion.div
            className="lg:col-span-7"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div className="relative">
              <div
                aria-hidden
                className="absolute top-8 bottom-8 left-[1.125rem] w-px bg-gradient-to-b from-primary/50 via-border to-transparent md:left-[1.375rem]"
              />

              <ol className="relative space-y-5 md:space-y-6">
                {steps.map((s, i) => (
                  <motion.li key={s.step} variants={item} className="relative pl-0 md:pl-0">
                    <div className="flex gap-5 md:gap-6">
                      <div className="flex shrink-0 flex-col items-center pt-1">
                        <div
                          className={cn(
                            "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-background shadow-sm md:h-11 md:w-11",
                            i === steps.length - 1
                              ? "border-primary/40 shadow-gold"
                              : "border-border shadow-sm",
                          )}
                        >
                          <s.icon className="h-4 w-4 text-primary md:h-[18px] md:w-[18px]" aria-hidden />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-soft transition-shadow duration-300 hover:border-primary/20 hover:shadow-card md:p-6">
                        <div className="flex flex-wrap items-center gap-2 gap-y-1">
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">
                            Step {s.step}
                          </span>
                          <span className="hidden h-3 w-px bg-border sm:inline" aria-hidden />
                          <span className="text-xs font-medium text-muted-foreground">
                            {i === 0 && "Resident"}
                            {i === 1 && "System"}
                            {i === 2 && "Security"}
                            {i === 3 && "EstateOS"}
                          </span>
                        </div>
                        <h3 className="font-display mt-3 text-lg font-semibold tracking-tight text-foreground md:text-xl">
                          {s.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
