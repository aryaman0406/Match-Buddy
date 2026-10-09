"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  language: "en" | "hinglish";
  onLanguageChange: (lang: "en" | "hinglish") => void;
}

export function TopBar({ language, onLanguageChange }: TopBarProps) {
  return (
    <header className="w-full flex items-center justify-between py-3.5 px-4 border-b border-theme bg-surface/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Brand logo & icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-accent-ai/80 flex items-center justify-center shadow-sm text-lg select-none ring-1 ring-white/10">
          🏏
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Match Buddy
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-ai/15 text-accent-ai border border-accent-ai/30 uppercase tracking-wider">
              AI
            </span>
          </div>
          <p className="text-[11px] text-text-muted hidden xs:block font-medium">
            Your live cricket couch buddy
          </p>
        </div>
      </div>

      {/* Action buttons: Language toggle & Theme toggle */}
      <div className="flex items-center gap-2.5">
        {/* Language selector pill */}
        <div
          role="group"
          aria-label="Language selection"
          className="bg-surface-raised border border-theme p-1 rounded-xl flex items-center shadow-inner"
        >
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            aria-pressed={language === "en"}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              language === "en"
                ? "bg-accent-ai text-white shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange("hinglish")}
            aria-pressed={language === "hinglish"}
            className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              language === "hinglish"
                ? "bg-accent-ai text-white shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            हिंग
          </button>
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <ThemeToggle />
      </div>
    </header>
  );
}
