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
      className="w-full flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar select-none"
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
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-2xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              isSelected
                ? "bg-white/[0.12] text-white border-white/[0.25] shadow-[0_2px_12px_rgba(0,0,0,0.3)] scale-[1.01]"
                : "bg-white/[0.04] border-white/[0.06] text-text-muted hover:text-foreground hover:bg-white/[0.08]"
            }`}
          >
            <span className="text-sm shrink-0">{m.sportIcon}</span>
            <span>{m.sportName}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                isSelected ? "bg-white/20 text-white" : "bg-black/20 text-text-muted"
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
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-2xl text-xs font-bold bg-white/[0.04] border border-dashed border-indigo-400/50 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-indigo-400" />
        <span>Custom Match</span>
      </button>
    </div>
  );
}
