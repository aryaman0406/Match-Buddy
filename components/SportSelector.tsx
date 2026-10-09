"use client";

import React from "react";
import { Plus } from "lucide-react";
import { SportMatchConfig, allSportsMatches } from "@/data/sportsData";

interface SportSelectorProps {
  currentMatchId: string;
  onSelectMatch: (matchConfig: SportMatchConfig) => void;
  onOpenCustomMatch: () => void;
  customMatches?: SportMatchConfig[];
}

export function SportSelector({
  currentMatchId,
  onSelectMatch,
  onOpenCustomMatch,
  customMatches = [],
}: SportSelectorProps) {
  const combinedList = [...allSportsMatches, ...customMatches];

  return (
    <div
      role="tablist"
      aria-label="Select Sport & Match"
      className="w-full flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar select-none"
    >
      {combinedList.map((m) => {
        const isSelected = m.id === currentMatchId;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectMatch(m)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-accent-ai text-white border-accent-ai shadow-sm scale-[1.02]"
                : "bg-surface-raised border-theme text-text-muted hover:text-foreground hover:border-theme/80"
            }`}
          >
            <span className="text-sm">{m.sportIcon}</span>
            <span>{m.sportName}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                isSelected ? "bg-white/20 text-white" : "bg-surface text-text-muted"
              }`}
            >
              {m.matchTitle}
            </span>
          </button>
        );
      })}

      {/* Any Sport / Custom Button */}
      <button
        type="button"
        onClick={onOpenCustomMatch}
        title="Follow any sport or custom team"
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold bg-surface-raised border border-dashed border-accent-ai/50 text-accent-ai hover:bg-accent-ai/10 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Any Sport</span>
      </button>
    </div>
  );
}
