"use client";

import React, { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Settings, X } from "lucide-react";

export type PersonaMode = "casual" | "analyst" | "desi";

interface TopBarProps {
  language: "en" | "hinglish";
  onLanguageChange: (lang: "en" | "hinglish") => void;
  currentSportIcon?: string;
  persona: PersonaMode;
  onPersonaChange: (p: PersonaMode) => void;
}

export function TopBar({
  language,
  onLanguageChange,
  currentSportIcon = "🏏",
  persona,
  onPersonaChange,
}: TopBarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gearBtnRef = useRef<HTMLButtonElement>(null);

  // Close settings popover on outside click or Escape key, returning focus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
        gearBtnRef.current?.focus();
      }
    }

    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  return (
    <header className="w-full flex items-center justify-between py-2.5 px-4 border-b border-theme bg-surface-glass backdrop-blur-xl sticky top-0 z-30 transition-colors">
      {/* Brand logo & icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-surface-raised border border-theme flex items-center justify-center text-lg select-none shrink-0 shadow-sm">
          {currentSportIcon}
        </div>
        <div>
          <span className="font-black text-base tracking-tight text-foreground block leading-tight">
            Match Buddy
          </span>
          <p className="text-xs text-muted hidden xs:block font-medium">
            Live Companion
          </p>
        </div>
      </div>

      {/* Action controls: Language toggle and Settings gear */}
      <div className="flex items-center gap-2">
        {/* Language selector pill */}
        <div
          role="group"
          aria-label="Language selection"
          suppressHydrationWarning
          className="bg-surface-raised border border-theme p-0.5 rounded-xl flex items-center shadow-inner"
        >
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => onLanguageChange("en")}
            aria-pressed={language === "en"}
            aria-label="English"
            className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              language === "en"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => onLanguageChange("hinglish")}
            aria-pressed={language === "hinglish"}
            aria-label="Hinglish"
            className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              language === "hinglish"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Hinglish
          </button>
        </div>

        {/* Settings gear button & popover */}
        <div className="relative" ref={popoverRef}>
          <button
            ref={gearBtnRef}
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Settings and companion preferences"
            aria-expanded={isSettingsOpen}
            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-surface-raised hover:bg-surface border border-theme flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 top-12 w-64 bg-surface border border-theme rounded-2xl shadow-2xl p-4 space-y-4 z-40 animate-scale-up">
              <div className="flex items-center justify-between border-b border-theme pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Companion Settings
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    gearBtnRef.current?.focus();
                  }}
                  aria-label="Close settings"
                  className="p-1 text-muted hover:text-foreground min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-surface-raised transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Persona tone selector */}
              <div className="space-y-1.5">
                <label htmlFor="settings-persona-select" className="text-xs font-semibold text-foreground block">
                  Companion Tone
                </label>
                <select
                  id="settings-persona-select"
                  value={persona}
                  onChange={(e) => onPersonaChange(e.target.value as PersonaMode)}
                  className="w-full h-9 px-2.5 rounded-xl bg-surface-raised border border-theme text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="casual" className="bg-surface text-foreground">🤝 Casual Fan</option>
                  <option value="analyst" className="bg-surface text-foreground">🧠 Tactical Analyst</option>
                  <option value="desi" className="bg-surface text-foreground">🇮🇳 Desi Couch Buddy</option>
                </select>
              </div>

              {/* Theme toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-theme">
                <span className="text-xs font-semibold text-foreground">
                  Appearance
                </span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

  );
}
