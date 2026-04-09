"use client";

import { ChevronDown } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const faqsData = [
  {
    question: "Lightning-Fast Performance",
    answer: "Built with speed - minimal load times and optimized rendering.",
  },
  {
    question: "Fully Customizable Components",
    answer: "Easily adjust styles, structure, and behavior to match your project needs.",
  },
  {
    question: "Responsive by Default",
    answer: "Every component is responsive by default - no extra CSS required.",
  },
  {
    question: "Tailwind CSS Powered",
    answer: "Built using Tailwind utility classes - no extra CSS or frameworks required.",
  },
  {
    question: "Dark Mode Support",
    answer: "All components support light and dark themes out of the box.",
  },
];

export default function FaqDemo() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center text-foreground sm:px-6">
        <p className="text-base font-medium text-muted-foreground">FAQ</p>
        <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          Proactively answering FAQs boosts user confidence and cuts down support tickets.
        </p>

        <div className="mt-6 flex w-full max-w-xl flex-col items-start gap-4 text-left">
          {faqsData.map((faq, index) => (
            <div key={faq.question} className="flex w-full flex-col items-start">
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded border border-border bg-muted/40 p-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-sm">{faq.question}</h3>
                <ChevronDown
                  className={cn(
                    "h-[18px] w-[18px] transition-all duration-500 ease-in-out",
                    openIndex === index && "rotate-180",
                  )}
                />
              </div>
              <p
                className={cn(
                  "px-4 text-sm text-muted-foreground transition-all duration-500 ease-in-out",
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
