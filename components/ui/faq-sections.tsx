"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "How does EstateOS improve security operations?",
    answer:
      "EstateOS centralizes gate access, incident logging, and live alerts so your team can verify visitors faster and respond to issues with full context.",
  },
  {
    question: "Are there more modules beyond visitor access?",
    answer:
      "Yes. The platform includes resident notifications, payments tracking, incident workflows, reports, and role-based dashboards for estate teams.",
  },
  {
    question: "Is the platform responsive on mobile and tablet?",
    answer:
      "Yes. Core views are designed to work across phone, tablet, and desktop so residents and staff can use EstateOS from any device.",
  },
  {
    question: "Can we customize workflows per estate?",
    answer:
      "Absolutely. You can configure roles, approval flows, pass types, and operating preferences to match your estate's rules and processes.",
  },
];

export default function FaqSections() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="bg-background py-16 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-center gap-8 px-4 sm:px-6 md:flex-row md:gap-10">
        <div className="w-full md:max-w-sm">
          <div className="relative aspect-5/6 overflow-hidden rounded-xl border border-border">
            <Image
              src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop"
              alt="Luxury estate exterior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        </div>

        <div className="w-full md:flex-1">
          <p className="text-sm font-medium text-primary">FAQ&apos;s</p>
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Looking for answer?
          </h2>
          <p className="mt-2 pb-4 text-sm text-muted-foreground">
            Ship beautiful frontends without the overhead - customizable, scalable and
            developer-friendly UI components.
          </p>

          {faqs.map((faq, index) => (
            <div
              className="cursor-pointer border-b border-border py-4"
              key={faq.question}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-medium text-foreground">{faq.question}</h3>
                <ChevronDown
                  className={cn(
                    "h-[18px] w-[18px] text-foreground transition-all duration-500 ease-in-out",
                    openIndex === index && "rotate-180",
                  )}
                />
              </div>
              <p
                className={cn(
                  "max-w-xl text-sm text-muted-foreground transition-all duration-500 ease-in-out",
                  openIndex === index
                    ? "max-h-[300px] translate-y-0 pt-4 opacity-100"
                    : "max-h-0 -translate-y-2 overflow-hidden opacity-0",
                )}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
