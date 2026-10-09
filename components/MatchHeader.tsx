"use client";

import React from "react";
import { Sparkles, Play, Pause, Radio } from "lucide-react";
import { MatchSituation } from "@/data/match";

interface MatchHeaderProps {
  matchData: MatchSituation;
  onOpenStorySoFar: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export function MatchHeader({
  matchData,
  onOpenStorySoFar,
  isSimulating,
  onToggleSimulation,
}: MatchHeaderProps) {
  // Calculate progress of overs (e.g. 14.2 overs out of 20)
  const currentOverFloat = parseFloat(matchData.overs);
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentOverFloat / matchData.totalOvers) * 100)
  );

  return (
    <section className="w-full bg-surface border border-theme rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-all">
      {/* Top row: Series badge, Live status, and Simulation toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Pulsing LIVE badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold text-xs uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-accent animate-live-pulse" />
            <span>LIVE</span>
          </div>

          <span className="text-xs font-semibold text-text-muted">
            {matchData.teams[0]} vs {matchData.teams[1]} · {matchData.series}
          </span>
        </div>

        {/* Live Simulation Play/Pause button */}
        <button
          type="button"
          onClick={onToggleSimulation}
          title={isSimulating ? "Pause live match simulation" : "Start live match simulation"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer min-h-[36px] ${
            isSimulating
              ? "bg-accent-ai/10 border-accent-ai/40 text-accent-ai animate-pulse"
              : "bg-surface-raised border-theme text-text-muted hover:text-foreground"
          }`}
          aria-label={isSimulating ? "Pause match simulation" : "Simulate live match"}
        >
          {isSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Auto-Ticking</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Simulate Live</span>
            </>
          )}
        </button>
      </div>

      {/* Score and Overs row */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[40px] leading-none font-extrabold tracking-tight tabular-nums text-foreground">
            {matchData.score}
          </span>
          <span className="text-sm font-semibold text-text-muted">
            {matchData.teams[0]}
          </span>
        </div>

        <div className="text-right">
          <span className="text-sm font-medium text-text-muted block">
            Overs
          </span>
          <span className="text-base font-bold tabular-nums text-foreground">
            {matchData.overs} / {matchData.totalOvers}
          </span>
        </div>
      </div>

      {/* Overs Progress Bar */}
      <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden border border-theme/60">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-ai transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Chase status line & Catch me up button */}
      <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-theme/60">
        <div className="text-xs sm:text-sm font-medium text-text-muted">
          Need <span className="font-bold text-foreground tabular-nums">{matchData.runsNeeded}</span> off{" "}
          <span className="font-bold text-foreground tabular-nums">{matchData.ballsLeft} balls</span>{" "}
          · RRR <span className="font-bold text-accent tabular-nums">{matchData.requiredRunRate}</span>
        </div>

        {/* Prompt 9: "Just joined? Catch me up" button */}
        <button
          type="button"
          onClick={onOpenStorySoFar}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent-ai/15 hover:bg-accent-ai/25 border border-accent-ai/35 text-accent-ai text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer min-h-[44px]"
          id="catch-me-up-btn"
          aria-label="Catch me up with the match story so far"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-ai animate-spin-slow" />
          <span>Just joined? Catch me up</span>
        </button>
      </div>
    </section>
  );
}
