"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
}) {
  if (pageCount <= 1) return null;

  const safePage = Math.min(Math.max(1, page), pageCount);
  const canPrev = safePage > 1;
  const canNext = safePage < pageCount;

  const pages: number[] = [];
  const start = Math.max(1, safePage - 2);
  const end = Math.min(pageCount, safePage + 2);
  for (let p = start; p <= end; p += 1) pages.push(p);

  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-medium text-foreground">{safePage}</span> of{" "}
        <span className="font-medium text-foreground">{pageCount}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {start > 1 && (
            <>
              <Button variant={safePage === 1 ? "default" : "outline"} size="sm" onClick={() => onPageChange(1)}>
                1
              </Button>
              {start > 2 && <span className="px-1 text-sm text-muted-foreground">…</span>}
            </>
          )}

          {pages.map((p) => (
            <Button
              key={p}
              variant={safePage === p ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ))}

          {end < pageCount && (
            <>
              {end < pageCount - 1 && <span className="px-1 text-sm text-muted-foreground">…</span>}
              <Button
                variant={safePage === pageCount ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageCount)}
              >
                {pageCount}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNext}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

