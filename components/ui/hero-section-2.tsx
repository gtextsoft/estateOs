"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <div className="overflow-hidden">
        <section>
          <div className="relative pt-10 md:pt-14">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,hsl(var(--background))_75%)]" />
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="sm:mx-auto lg:mr-auto">
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <h1 className="font-display mt-6 max-w-2xl text-balance text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl sm:mt-8 lg:mt-16">
                    The Operating System for{" "}
                    <span className="text-gradient-gold">Luxury Estates</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:mt-8 sm:text-lg">
                    Seamless visitor access, real-time security monitoring, and intelligent estate operations
                    all in one elegant platform.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                    <div className="w-full rounded-[14px] border border-border/60 bg-foreground/5 p-0.5 sm:w-auto">
                      <Button asChild size="lg" className="w-full rounded-xl px-5 text-base shadow-gold sm:w-auto">
                        <Link href="/dashboard">
                          <span className="text-nowrap">Start Free Trial</span>
                        </Link>
                      </Button>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      variant="ghost"
                      className="h-[42px] w-full rounded-xl px-5 text-base sm:w-auto"
                    >
                      <Link href="#how-it-works">
                        <span className="text-nowrap">See How It Works</span>
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative mt-8 w-full max-w-full overflow-hidden px-4 sm:mt-12 sm:px-6 md:mt-20">
                <div
                  aria-hidden
                  className="absolute inset-0 z-10 bg-linear-to-b from-transparent from-35% to-background"
                />
                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/80 bg-background p-4 shadow-lg shadow-foreground/10 ring-1 ring-border">
                  <div className="relative aspect-15/8 overflow-hidden rounded-2xl border border-border/25 bg-muted/30">
                    <Image
                      src="/assets/hero-estate.jpg"
                      alt="EstateOS dashboard and secure estate access"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 1024px"
                      priority
                    />
                  </div>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-4 sm:px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link href="#features" className="block text-sm duration-150 hover:opacity-75">
                <span> Explore platform features</span>
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 transition-all duration-500 group-hover:opacity-50 group-hover:blur-sm sm:grid-cols-4 sm:gap-x-16 sm:gap-y-14 sm:mt-12">
              {[
                { src: "https://html.tailus.io/blocks/customers/nvidia.svg", alt: "Nvidia", h: "h-5" },
                { src: "https://html.tailus.io/blocks/customers/column.svg", alt: "Column", h: "h-4" },
                { src: "https://html.tailus.io/blocks/customers/github.svg", alt: "GitHub", h: "h-4" },
                { src: "https://html.tailus.io/blocks/customers/nike.svg", alt: "Nike", h: "h-5" },
                { src: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg", alt: "Lemon Squeezy", h: "h-5" },
                { src: "https://html.tailus.io/blocks/customers/laravel.svg", alt: "Laravel", h: "h-4" },
                { src: "https://html.tailus.io/blocks/customers/lilly.svg", alt: "Lilly", h: "h-7" },
                { src: "https://html.tailus.io/blocks/customers/openai.svg", alt: "OpenAI", h: "h-6" },
              ].map((logo) => (
                <div key={logo.alt} className="flex">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={cn("mx-auto w-fit opacity-60 grayscale", logo.h)}
                    src={logo.src}
                    alt={`${logo.alt} logo`}
                    height={24}
                    width={120}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
