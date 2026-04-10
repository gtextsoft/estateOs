"use client";

import { motion } from "motion/react";
import {
  TestimonialQuoteCard,
  TestimonialsColumn,
  type Testimonial,
} from "@/components/ui/testimonials-columns-1";

const testimonials: Testimonial[] = [
  {
    text: "EstateOS replaced three different tools at our gate. Visitors check in in seconds and our security team finally has one live view of the estate.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format",
    name: "Amara Chen",
    role: "Estate Manager, Lakeside Reserve",
  },
  {
    text: "Resident passes and guest QR codes just work. Training the front desk took an afternoon — the interface is that clear.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
    name: "James Okonkwo",
    role: "Head of Security",
  },
  {
    text: "Billing and service charges used to be spreadsheets. Now reminders go out automatically and we can prove every line item.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format",
    name: "Priya Nair",
    role: "HOA Treasurer",
  },
  {
    text: "When an incident is reported, everyone who needs to know gets the thread with photos and status. Resolution time dropped sharply.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format",
    name: "Daniel Frost",
    role: "Operations Director",
  },
  {
    text: "We run multiple communities from one dashboard. Onboarding a new estate no longer means another vendor negotiation.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format",
    name: "Elena Vasquez",
    role: "Portfolio Lead",
  },
  {
    text: "Residents love the app notifications for deliveries and guests. Support tickets about access dropped within the first month.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format",
    name: "Marcus Webb",
    role: "Community Lead",
  },
  {
    text: "Audit logs and role-based access were non-negotiable for our board. EstateOS checked every box without feeling corporate-heavy.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format",
    name: "Sofia Andersson",
    role: "Board Secretary",
  },
  {
    text: "The analytics on visitor patterns helped us adjust guard rotations. It’s rare that software actually changes physical staffing.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&auto=format",
    name: "David Park",
    role: "Chief of Staff",
  },
  {
    text: "Implementation was weeks, not months. Their team understood gated communities — not generic enterprise rollout.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format",
    name: "Nina Kowalski",
    role: "Property Director",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection({
  variant = "marquee",
}: {
  /** Use `static` on the full testimonials page — readable grid, no scrolling columns. */
  variant?: "marquee" | "static";
}) {
  const isStatic = variant === "static";

  return (
    <section
      id="testimonials"
      className={
        isStatic
          ? "relative my-10 scroll-mt-24 sm:my-14"
          : "relative my-16 scroll-mt-24 bg-background sm:my-20"
      }
    >
      <div className="container z-10 mx-auto min-w-0 max-w-full px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border border-border px-4 py-1 text-xs font-medium text-muted-foreground">
              Testimonials
            </div>
          </div>

          <h2 className="mt-5 text-balance text-center font-display text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            What estates say about EstateOS
          </h2>
          <p className="mt-5 text-center text-muted-foreground">
            Security leads, managers, and residents on running calmer, smarter communities.
          </p>
        </motion.div>

        {isStatic ? (
          <div className="mx-auto mt-10 grid w-full max-w-5xl grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <TestimonialQuoteCard key={`${item.name}-${index}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-8 flex max-h-[min(680px,78svh)] min-w-0 items-start justify-center gap-4 overflow-hidden px-2 sm:mt-10 sm:max-h-[min(760px,80vh)] sm:gap-5 sm:px-4 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
            <TestimonialsColumn testimonials={firstColumn} className="min-w-0" duration={18} />
            <TestimonialsColumn
              testimonials={secondColumn}
              className="hidden min-w-0 md:flex"
              duration={18}
            />
            <TestimonialsColumn
              testimonials={thirdColumn}
              className="hidden min-w-0 lg:flex"
              duration={18}
            />
          </div>
        )}
      </div>
    </section>
  );
}
