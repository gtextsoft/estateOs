"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Files,
  Flower,
  GalleryVerticalEnd,
  MapPin,
} from "lucide-react";
import DottedMap from "dotted-map";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import * as React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const mapInstance = new DottedMap({ height: 55, grid: "diagonal" });
const mapPoints = mapInstance.getPoints();

const featuredCaseStudy = {
  company: "EstateOS",
  tags: "Platform",
  title: "How leading estates run on EstateOS",
  subtitle:
    "with zero compromise on security, visibility, and resident experience.",
};

const chartData = [
  { month: "May", desktop: 56, mobile: 224 },
  { month: "June", desktop: 90, mobile: 300 },
  { month: "July", desktop: 126, mobile: 252 },
  { month: "Aug", desktop: 205, mobile: 410 },
  { month: "Sep", desktop: 200, mobile: 126 },
  { month: "Oct", desktop: 400, mobile: 800 },
];

const chartConfig = {
  desktop: {
    label: "Security desk (web)",
    color: "hsl(38 65% 50%)",
  },
  mobile: {
    label: "Resident app",
    color: "hsl(40 55% 52%)",
  },
} satisfies ChartConfig;

interface Message {
  title: string;
  time: string;
  content: string;
  gradient: string;
}

const activityMessages: Message[] = [
  {
    title: "Gate team",
    time: "1m ago",
    content: "Visitor QR verified — North Gate. Vehicle logged.",
    gradient: "from-amber-500/90 to-primary",
  },
  {
    title: "Security alert",
    time: "3m ago",
    content: "Motion cleared on perimeter camera B12.",
    gradient: "from-primary to-amber-700/80",
  },
  {
    title: "Residents",
    time: "6m ago",
    content: "12 new guest passes issued this afternoon.",
    gradient: "from-amber-400/90 to-rose-500/70",
  },
  {
    title: "Billing",
    time: "10m ago",
    content: "Service charge reminders queued for Block C.",
    gradient: "from-emerald-500/80 to-primary/90",
  },
  {
    title: "Integrations",
    time: "12m ago",
    content: "Access control sync completed successfully.",
    gradient: "from-sky-500/70 to-primary",
  },
  {
    title: "Weekly recap",
    time: "15m ago",
    content: "Incident count down 18% vs. last week.",
    gradient: "from-amber-300/90 to-amber-600/80",
  },
];

export default function CombinedFeaturedSection() {
  return (
    <section id="features" className="overflow-x-hidden bg-gradient-cream py-16 sm:py-20 md:py-24">
      <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 px-4 sm:px-6 md:grid-cols-2 md:grid-rows-2">
        <div className="relative min-w-0 overflow-hidden rounded-none border border-border bg-muted p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            EstateOS Insights
          </div>
          <h3 className="font-display text-balance text-lg font-normal text-foreground sm:text-xl">
            Visualize access activity across your estate.{" "}
            <span className="text-muted-foreground">
              Track, analyze, and optimize where it matters.
            </span>
          </h3>

          <div className="relative mt-4 min-w-0">
            <div className="absolute left-1/2 top-12 z-10 flex max-w-[min(100%,18rem)] -translate-x-1/2 items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-center text-[10px] font-medium leading-tight text-foreground shadow-sm sm:top-16 sm:max-w-none sm:gap-2 sm:px-3 sm:text-xs">
              <span aria-hidden>📍</span>{" "}
              <span className="break-words">Last activity — Main Gate</span>
            </div>
            <DottedMapSvg />
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 rounded-none border border-border bg-card p-4 sm:p-6">
          <div>
            <span className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <GalleryVerticalEnd className="h-4 w-4" /> {featuredCaseStudy.tags}
            </span>
            <h3 className="font-display text-balance text-lg font-normal text-foreground sm:text-xl">
              {featuredCaseStudy.title}{" "}
              <span className="text-muted-foreground">{featuredCaseStudy.subtitle}</span>
            </h3>
          </div>
          <div className="flex w-full items-center justify-center">
            <ActivityFeedCard className="max-w-sm" />
          </div>
        </div>

        <div className="min-w-0 space-y-4 rounded-none border border-border bg-muted p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 shrink-0" />
            Live metrics
          </div>
          <h3 className="font-display text-balance text-lg font-normal text-foreground sm:text-xl">
            Real-time gate and visitor analytics.{" "}
            <span className="text-muted-foreground">
              Spot trends and act before issues escalate.
            </span>
          </h3>
          <div className="w-full min-w-0">
            <MonitoringChart />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 rounded-none bg-card sm:grid-cols-2">
          <FeatureCard
            icon={<Files className="h-4 w-4" />}
            image="https://images.unsplash.com/photo-1600596542815-ffad4b1530a9?w=800&q=80"
            title="QR visitor access"
            subtitle="Instant issuance"
            description="Secure passes your guards can scan in seconds."
          />
          <FeatureCard
            icon={<Flower className="h-4 w-4" />}
            title="Security workflows"
            subtitle="Flexible by design"
            description="Adapt roles, zones, and approvals to your estate."
            feed={<ActivityFeedCard />}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  image,
  title,
  subtitle,
  description,
  feed,
}: {
  icon: React.ReactNode;
  image?: string;
  title: string;
  subtitle: string;
  description: string;
  feed?: React.ReactNode;
}) {
  if (feed) {
    return (
      <div className="relative flex min-h-[260px] min-w-0 flex-col gap-3 border border-border bg-background p-4 transition sm:min-h-0">
        <div className="flex shrink-0 items-center gap-4">
          <div>
            <span className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              {icon}
              {title}
            </span>
            <h3 className="font-display text-lg font-normal text-foreground">
              {subtitle}{" "}
              <span className="text-muted-foreground">{description}</span>
            </h3>
          </div>
        </div>
        <div className="flex min-h-0 w-full flex-1 items-stretch justify-center">{feed}</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[260px] min-w-0 flex-col gap-3 border border-border bg-background p-4 pb-24 transition sm:min-h-0 sm:pb-4">
      <div className="flex items-center gap-4">
        <div>
          <span className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            {icon}
            {title}
          </span>
          <h3 className="font-display text-lg font-normal text-foreground">
            {subtitle}{" "}
            <span className="text-muted-foreground">{description}</span>
          </h3>
        </div>
      </div>

      <Card className="absolute bottom-0 right-0 h-20 w-24 overflow-hidden rounded-br-none rounded-tl-xl rounded-tr-none border-8 border-b-0 border-r-0 border-border p-0 sm:h-28 sm:w-32 md:h-32 md:w-40">
        {image ? <Image src={image} alt="" fill className="object-cover" sizes="160px" /> : null}
      </Card>

      <Link
        href="#features"
        className="absolute bottom-2 right-2 z-10 flex items-center gap-2 rounded-full border border-border bg-background p-3 transition hover:-rotate-45"
        aria-label={`More about ${title}`}
      >
        <ArrowRight className="h-4 w-4 text-primary" />
      </Link>
    </div>
  );
}

function DottedMapSvg() {
  return (
    <svg viewBox="0 0 120 60" className="h-auto w-full text-primary/70 dark:text-primary/40">
      {mapPoints.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r={0.15} fill="currentColor" />
      ))}
    </svg>
  );
}

function MonitoringChart() {
  return (
    <ChartContainer className="aspect-auto h-48 w-full min-w-0 sm:h-60" config={chartConfig}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
            <stop offset="55%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
            <stop offset="55%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis hide />
        <YAxis hide />
        <CartesianGrid vertical={false} horizontal={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent className="dark:bg-muted" />} />
        <Area
          strokeWidth={2}
          dataKey="mobile"
          type="monotone"
          fill="url(#fillMobile)"
          stroke="var(--color-mobile)"
        />
        <Area
          strokeWidth={2}
          dataKey="desktop"
          type="monotone"
          fill="url(#fillDesktop)"
          stroke="var(--color-desktop)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

function ActivityFeedCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[280px] w-full max-w-full overflow-hidden bg-card p-2 font-sans shadow-inner",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-linear-to-t from-card to-transparent" />

      <div className="relative z-0 space-y-2">
        {activityMessages.map((msg, i) => (
          <div
            key={msg.title}
            className="flex animate-scaleUp cursor-default items-start gap-3 rounded-lg border border-border p-3 opacity-0 transition duration-300 ease-in-out"
            style={{
              animationDelay: `${i * 300}ms`,
              animationFillMode: "forwards",
            }}
          >
            <div
              className={cn(
                "h-8 min-h-8 w-8 min-w-8 rounded-lg bg-linear-to-br",
                msg.gradient,
              )}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                {msg.title}
                <span className="text-xs text-muted-foreground before:mr-1 before:content-['•']">
                  {msg.time}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
