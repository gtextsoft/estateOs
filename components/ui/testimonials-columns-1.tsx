"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export function TestimonialQuoteCard({
  item,
  className,
}: {
  item: Testimonial;
  className?: string;
}) {
  return (
    <div className={cn("w-full rounded-3xl border border-border bg-card p-5 shadow-lg shadow-primary/10 sm:p-8", className)}>
      <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
      <div className="mt-5 flex items-center gap-2">
        <Image width={40} height={40} src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium leading-5 tracking-tight">{item.name}</div>
          <div className="text-sm leading-5 tracking-tight text-muted-foreground">{item.role}</div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsColumn(props: { className?: string; testimonials: Testimonial[]; duration?: number }) {
  const { className, testimonials, duration = 10 } = props;
  return (
    <div className={cn("flex min-h-0 w-[min(100%,18rem)] shrink-0 flex-col items-stretch sm:w-72", className)}>
      <motion.div
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="flex w-full flex-col gap-6 bg-background pb-6"
      >
        {Array.from({ length: 2 }).map((_, colIndex) => (
          <React.Fragment key={colIndex}>
            {testimonials.map((item, i) => (
              <TestimonialQuoteCard key={`${colIndex}-${item.name}-${i}`} item={item} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
