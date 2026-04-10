import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";

export const metadata: Metadata = {
  title: "Testimonials | EstateOS",
  description: "What security teams, estate managers, and residents say about EstateOS.",
};

export default function TestimonialsPage() {
  return (
    <div className="bg-gradient-cream pb-24 pt-8">
      <div className="container mx-auto mb-10 px-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          Home
        </Link>{" "}
        / Testimonials
      </div>
      <TestimonialsSection variant="static" />
    </div>
  );
}
