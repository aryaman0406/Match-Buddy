"use client";

import React, { useState } from "react";
import { ArrowUp, Search } from "lucide-react";

interface AskBarProps {
  onAskQuestion: (query: string) => void;
  isLoading: boolean;
  quickChips?: string[] | readonly string[];
  placeholder?: string;
}

export function AskBar({
  onAskQuestion,
  isLoading,
  quickChips = ["DLS Method", "LBW Rule", "Super Over"],
  placeholder = "Ask anything about this match, player, or rule...",
}: AskBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onAskQuestion(query.trim());
    setQuery("");
  };

  const handleChipClick = (chip: string) => {
    if (isLoading) return;
    onAskQuestion(chip);
  };

  return (
    <nav
      aria-label="Match Query Dock"
      className="fixed bottom-0 left-0 right-0 z-20 flex justify-center pointer-events-none px-3 pb-3 pt-2"
    >
      <div className="w-full max-w-[480px] bg-surface-glass/95 backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-3 shadow-2xl pointer-events-auto space-y-2.5 transition-all">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0 pl-1">
            Explore:
          </span>
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 min-h-[30px] rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-text-muted hover:text-foreground transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              maxLength={300}
              disabled={isLoading}
              className="w-full h-11 min-h-[44px] pl-10 pr-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-foreground placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
              aria-label="Ask any sports question"
              id="ask-rule-input"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            aria-label="Submit question"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-md"
            id="ask-send-btn"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>
    </nav>
  );
}
