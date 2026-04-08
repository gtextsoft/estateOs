"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;
  --pill-bg-1: hsl(var(--foreground) / 0.04);
  --pill-bg-2: hsl(var(--foreground) / 0.02);
  --pill-shadow: hsl(var(--background) / 0.5);
  --pill-highlight: hsl(var(--foreground) / 0.08);
  --pill-inset-shadow: hsl(var(--background) / 0.85);
  --pill-border: hsl(var(--foreground) / 0.1);
  --pill-bg-1-hover: hsl(var(--foreground) / 0.08);
  --pill-bg-2-hover: hsl(var(--foreground) / 0.03);
  --pill-border-hover: hsl(var(--foreground) / 0.18);
  --pill-shadow-hover: hsl(var(--background) / 0.65);
  --pill-highlight-hover: hsl(var(--foreground) / 0.15);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.95; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px hsl(var(--primary) / 0.35)); }
  15%, 45% { transform: scale(1.15); filter: drop-shadow(0 0 10px hsl(var(--primary) / 0.55)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 42s linear infinite; }
.animate-footer-heartbeat { animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }

.footer-bg-grid {
  background-size: 56px 56px;
  background-image:
    linear-gradient(to right, hsl(var(--foreground) / 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--foreground) / 0.04) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 28%, black 72%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 28%, black 72%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    hsl(var(--primary) / 0.14) 0%,
    hsl(var(--secondary) / 0.08) 42%,
    transparent 68%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: hsl(var(--foreground));
}

.footer-giant-bg-text {
  font-size: min(26vw, 18rem);
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px hsl(var(--foreground) / 0.07);
  background: linear-gradient(180deg, hsl(var(--foreground) / 0.12) 0%, transparent 58%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, hsl(var(--foreground)) 0%, hsl(var(--foreground) / 0.45) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 24px hsl(var(--foreground) / 0.12));
}
`;

function useMagnetic(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = e.clientX - cx;
      const y = e.clientY - cy;

      gsap.to(element, {
        x: x * 0.35,
        y: y * 0.35,
        rotationX: -y * 0.12,
        rotationY: x * 0.12,
        scale: 1.04,
        ease: "power2.out",
        duration: 0.35,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        ease: "elastic.out(1, 0.35)",
        duration: 1,
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref]);
}

function MagneticLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref);
  return (
    <a ref={ref} href={href} className={cn("inline-flex cursor-pointer items-center justify-center", className)}>
      {children}
    </a>
  );
}

function MagneticPress({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  useMagnetic(ref);
  return (
    <button ref={ref} type="button" className={cn("inline-flex items-center justify-center", className)} {...props}>
      {children}
    </button>
  );
}

const MarqueeItem = () => (
  <div className="flex items-center space-x-10 px-6 md:space-x-14">
    <span>Gate-grade security</span>
    <span className="text-primary/70">✦</span>
    <span>Real-time visibility</span>
    <span className="text-primary/70">✦</span>
    <span>Resident-first access</span>
    <span className="text-primary/70">✦</span>
    <span>Audit-ready logs</span>
    <span className="text-primary/70">✦</span>
    <span>QR in under 3 seconds</span>
    <span className="text-primary/70">✦</span>
    <span>Built for luxury estates</span>
    <span className="text-primary/70">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      if (giantTextRef.current) {
        gsap.fromTo(
          giantTextRef.current,
          { y: "8vh", scale: 0.92, opacity: 0.4 },
          {
            y: "0vh",
            scale: 1,
            opacity: 1,
            ease: "power1.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 85%",
              end: "bottom bottom",
              scrub: 1.2,
            },
          },
        );
      }

      if (headingRef.current && linksRef.current) {
        gsap.fromTo(
          [headingRef.current, linksRef.current],
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 55%",
              end: "bottom bottom",
              scrub: 1,
            },
          },
        );
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground">
          <div className="footer-aurora pointer-events-none absolute top-1/2 left-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />

          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[4vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            ESTATE
          </div>

          <div className="absolute top-10 left-0 z-10 w-full -rotate-1 scale-[1.06] overflow-hidden border-y border-border/50 bg-background/70 py-3 shadow-2xl backdrop-blur-md md:top-12 md:py-4">
            <div className="animate-footer-scroll-marquee flex w-max text-[10px] font-bold tracking-[0.28em] text-muted-foreground uppercase md:text-xs">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-16 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 md:mt-20">
            <h2
              ref={headingRef}
              className="footer-text-glow mb-10 text-center font-display text-4xl font-black tracking-tighter md:mb-14 md:text-7xl lg:text-8xl"
            >
              Ready when you are
            </h2>

            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-wrap justify-center gap-3 md:gap-4">
                <MagneticLink
                  href="/signup"
                  className="footer-glass-pill group flex gap-3 rounded-full px-8 py-4 text-sm font-bold text-foreground md:px-10 md:py-5 md:text-base"
                >
                  <Sparkles className="h-5 w-5 text-primary transition-colors group-hover:text-foreground" />
                  Get started
                </MagneticLink>

                <MagneticLink
                  href="/login"
                  className="footer-glass-pill group flex gap-3 rounded-full px-8 py-4 text-sm font-bold text-foreground md:px-10 md:py-5 md:text-base"
                >
                  <LogIn className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  Sign in
                </MagneticLink>
              </div>

              <div className="mt-1 flex w-full flex-wrap justify-center gap-2 md:gap-4">
                <MagneticLink
                  href="/privacy"
                  className="footer-glass-pill rounded-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground md:px-6 md:py-3 md:text-sm"
                >
                  Privacy
                </MagneticLink>
                <MagneticLink
                  href="/terms"
                  className="footer-glass-pill rounded-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground md:px-6 md:py-3 md:text-sm"
                >
                  Terms
                </MagneticLink>
                <MagneticLink
                  href="/support"
                  className="footer-glass-pill rounded-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground md:px-6 md:py-3 md:text-sm"
                >
                  Support
                </MagneticLink>
                <MagneticLink
                  href="/testimonials"
                  className="footer-glass-pill rounded-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground md:px-6 md:py-3 md:text-sm"
                >
                  Stories
                </MagneticLink>
              </div>

              <Link
                href="/#features"
                className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary md:text-sm"
              >
                Explore platform features
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
            <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase md:order-1 md:text-xs">
              © {new Date().getFullYear()} EstateOS. All rights reserved.
            </div>

            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full border-border/50 px-5 py-2.5 md:order-2 md:px-6 md:py-3">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase md:text-xs">
                Crafted for
              </span>
              <span className="animate-footer-heartbeat text-sm text-primary md:text-base">♥</span>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase md:text-xs">
                modern estates
              </span>
            </div>

            <MagneticPress
              onClick={scrollToTop}
              className="footer-glass-pill group h-11 w-11 rounded-full text-muted-foreground hover:text-foreground md:order-3 md:h-12 md:w-12"
              aria-label="Back to top"
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticPress>
          </div>
        </footer>
      </div>
    </>
  );
}
