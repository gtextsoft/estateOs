"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export function TestimonialsColumn(props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  const { className, testimonials, duration = 10 } = props;

  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 bg-background pb-6"
      >
        {Array.from({ length: 2 }).map((_, colIndex) => (
          <React.Fragment key={colIndex}>
            {testimonials.map((item, i) => (
              <div
                className="w-full max-w-xs rounded-3xl border border-border bg-card p-5 shadow-lg shadow-primary/10 sm:p-8"
                key={`${colIndex}-${item.name}-${i}`}
              >
                <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
                <div className="mt-5 flex items-center gap-2">
                  <Image
                    width={40}
                    height={40}
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="text-sm font-medium leading-5 tracking-tight">{item.name}</div>
                    <div className="text-sm leading-5 tracking-tight text-muted-foreground">
                      {item.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
