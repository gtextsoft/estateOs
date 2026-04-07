"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-foreground/30 flex items-center justify-center p-4 sm:p-6"
        onMouseDown={onClose}
        aria-hidden
      >
        <div
          className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-elevated overflow-hidden max-h-[85dvh]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-display text-base font-semibold text-foreground">
              {title}
            </h3>
            <button
              className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="p-5 overflow-y-auto max-h-[calc(85dvh-64px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

