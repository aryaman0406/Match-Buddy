"use client";

import React, { useState } from "react";
import { Send, HelpCircle, Sparkles } from "lucide-react";

interface AskBarProps {
  onAskQuestion: (query: string) => void;
  isLoading: boolean;
}

export function AskBar({ onAskQuestion, isLoading }: AskBarProps) {
  const [query, setQuery] = useState("");

  const quickChips = [
    "What is DLS?",
    "What is LBW?",
    "What is a super over?",
  ];

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
      aria-label="Ask Match Buddy"
      className="fixed bottom-0 left-0 right-0 z-20 flex justify-center pointer-events-none px-3 pb-3 pt-2"
    >
      <div className="w-full max-w-[480px] bg-surface/95 backdrop-blur-xl border border-theme rounded-2xl p-3 shadow-2xl pointer-events-auto space-y-2.5 transition-all">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-text-muted shrink-0 pl-1">
            <Sparkles className="w-3 h-3 text-accent-ai" />
            <span>Ask:</span>
          </div>
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 min-h-[32px] rounded-full bg-surface-raised border border-theme text-xs font-medium text-text-muted hover:text-foreground hover:border-accent-ai/50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Search / Question Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Confused by a rule? Ask me"
              maxLength={200}
              disabled={isLoading}
              className="w-full h-11 min-h-[44px] pl-9 pr-3 rounded-xl bg-surface-raised border border-theme text-foreground placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-ai transition-colors"
              aria-label="Ask any cricket rule or match question"
              id="ask-rule-input"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            aria-label="Send question"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-accent-ai hover:bg-accent-ai/90 disabled:opacity-40 text-white flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-md"
            id="ask-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </nav>
  );
}
