"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Key } from "lucide-react";

export type PersonaMode = "casual" | "analyst" | "desi";

interface TopBarProps {
  language: "en" | "hinglish";
  onLanguageChange: (lang: "en" | "hinglish") => void;
  hasGeminiKey: boolean;
  onOpenApiKeyModal: () => void;
  currentSportIcon?: string;
  persona: PersonaMode;
  onPersonaChange: (p: PersonaMode) => void;
}

export function TopBar({
  language,
  onLanguageChange,
  hasGeminiKey,
  onOpenApiKeyModal,
  currentSportIcon = "🏏",
  persona,
  onPersonaChange,
}: TopBarProps) {
  return (
    <header className="w-full flex items-center justify-between py-2.5 px-3 border-b border-theme bg-surface/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Brand logo & icon */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-accent-ai/80 flex items-center justify-center shadow-sm text-base select-none ring-1 ring-white/10 shrink-0">
          {currentSportIcon}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-foreground">
              Match Buddy
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-accent-ai/15 text-accent-ai border border-accent-ai/30 uppercase tracking-wider">
              AI
            </span>
          </div>
          <p className="text-[10px] text-text-muted hidden xs:block font-medium">
            Live sports companion for casual fans
          </p>
        </div>
      </div>

      {/* Action controls: Persona selector, Gemini Key, Language toggle, Theme */}
      <div className="flex items-center gap-1.5">
        {/* Persona Mode selector */}
        <div className="relative">
          <select
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value as PersonaMode)}
            title="Choose AI companion persona / tone"
            aria-label="AI companion tone"
            className="h-8 pl-2 pr-5 rounded-xl bg-surface-raised border border-theme text-foreground text-[11px] font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-ai appearance-none shadow-sm"
          >
            <option value="casual">🤝 Casual</option>
            <option value="analyst">🧠 Analyst</option>
            <option value="desi">🇮🇳 Desi</option>
          </select>
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-text-muted">
            ▾
          </span>
        </div>

        {/* Gemini API Key Button */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          title="Configure Google Gemini API Key"
          className={`flex items-center gap-1 px-2 py-1 min-h-[32px] rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            hasGeminiKey
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-surface-raised border-theme text-text-muted hover:text-foreground hover:border-accent-ai/40"
          }`}
        >
          <Key className="w-3 h-3 text-accent-ai" />
          <span className="hidden sm:inline">
            {hasGeminiKey ? "Gemini ⚡" : "Gemini Key"}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasGeminiKey ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
        </button>

        {/* Language selector pill */}
        <div
          role="group"
          aria-label="Language selection"
          className="bg-surface-raised border border-theme p-0.5 rounded-xl flex items-center shadow-inner"
        >
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            aria-pressed={language === "en"}
            className={`px-2 py-1 min-h-[30px] rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
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
            className={`px-2 py-1 min-h-[30px] rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
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
