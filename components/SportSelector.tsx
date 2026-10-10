"use client";

import React, { useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { SportMatchConfig } from "@/data/types";

interface SportSelectorProps {
  currentMatchId: string;
  onSelectMatch: (matchConfig: SportMatchConfig) => void;
  matches: SportMatchConfig[];
}

export function SportSelector({
  currentMatchId,
  onSelectMatch,
  matches,
}: SportSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active tab into view smoothly
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentMatchId]);

  return (
    <div className="relative w-full">
      {/* Scrollable tablist */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Select Sport & Match"
        className="w-full flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar select-none scroll-smooth"
      >
        {matches.map((m) => {
          const isSelected = m.id === currentMatchId;
          return (
            <button
              key={m.id}
              ref={isSelected ? activeBtnRef : null}
              type="button"
              role="tab"
              aria-selected={isSelected}
              id={`tab-${m.sportId}`}
              aria-controls={`panel-${m.sportId}`}
              onClick={() => onSelectMatch(m)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-2xl text-xs font-bold border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-[1.01]"
                  : "bg-surface border-theme text-muted hover:text-foreground hover:bg-surface-raised hover:border-border-focus"
              }`}
            >
              <span className="text-base shrink-0" aria-hidden="true">
                {m.sportIcon}
              </span>
              <span className="font-bold">{m.sportName}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isSelected ? "bg-white/20 text-white" : "bg-surface-raised border border-theme text-muted"
                }`}
              >
                {m.matchTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right scroll hint edge fade with subtle arrow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background via-background/60 to-transparent flex items-center justify-end pr-0.5 sm:hidden"
      >
        <ChevronRight className="w-3.5 h-3.5 text-muted/60 animate-pulse" />
      </div>

    </div>
  );
}
