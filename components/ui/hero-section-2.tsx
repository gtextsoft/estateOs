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
            <div className="mx-auto max-w-5xl px-6">
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
                  <h1 className="font-display mt-8 max-w-2xl text-balance text-5xl font-medium tracking-tight md:text-6xl lg:mt-16">
                    The Operating System for{" "}
                    <span className="text-gradient-gold">Luxury Estates</span>
                  </h1>
                  <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                    Seamless visitor access, real-time security monitoring, and intelligent estate operations
                    all in one elegant platform.
                  </p>
                  <div className="mt-12 flex flex-wrap items-center gap-2">
                    <div className="rounded-[14px] border border-border/60 bg-foreground/5 p-0.5">
                      <Button asChild size="lg" className="rounded-xl px-5 text-base shadow-gold">
                        <Link href="/dashboard">
                          <span className="text-nowrap">Start Free Trial</span>
                        </Link>
                      </Button>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      variant="ghost"
                      className="h-[42px] rounded-xl px-5 text-base"
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
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
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
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link href="#features" className="block text-sm duration-150 hover:opacity-75">
                <span> Explore platform features</span>
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 group-hover:blur-sm sm:gap-x-16 sm:gap-y-14">
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
