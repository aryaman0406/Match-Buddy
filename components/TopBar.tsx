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
    <header className="w-full flex items-center justify-between py-2.5 px-3.5 border-b border-white/[0.07] bg-surface-glass/95 backdrop-blur-xl sticky top-0 z-30 transition-colors">
      {/* Brand logo & icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-base select-none shrink-0 shadow-sm">
          {currentSportIcon}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-tight text-foreground">
              Match Buddy
            </span>
          </div>
          <p className="text-[10px] text-text-muted hidden xs:block font-medium">
            Live Sports Companion
          </p>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Persona Mode selector */}
        <div className="relative">
          <select
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value as PersonaMode)}
            title="Choose companion persona / tone"
            aria-label="Companion tone"
            className="h-8 pl-2.5 pr-6 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-foreground text-[11px] font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none shadow-sm transition-colors"
          >
            <option value="casual" className="bg-[#111520] text-white">🤝 Casual</option>
            <option value="analyst" className="bg-[#111520] text-white">🧠 Analyst</option>
            <option value="desi" className="bg-[#111520] text-white">🇮🇳 Desi</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-text-muted">
            ▾
          </span>
        </div>

        {/* Gemini API Key Button */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          title="Configure Google Gemini API Key"
          className={`flex items-center gap-1 px-2.5 py-1 min-h-[32px] rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            hasGeminiKey
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-white/[0.05] border-white/[0.08] text-text-muted hover:text-foreground hover:border-white/20"
          }`}
        >
          <Key className="w-3 h-3 text-indigo-400" />
          <span className="hidden sm:inline">
            {hasGeminiKey ? "Gemini ⚡" : "API Key"}
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
          className="bg-white/[0.05] border border-white/[0.08] p-0.5 rounded-xl flex items-center shadow-inner"
        >
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            aria-pressed={language === "en"}
            className={`px-2.5 py-1 min-h-[28px] rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              language === "en"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange("hinglish")}
            aria-pressed={language === "hinglish"}
            className={`px-2.5 py-1 min-h-[28px] rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              language === "hinglish"
                ? "bg-indigo-500 text-white shadow-sm"
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
