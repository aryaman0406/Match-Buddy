"use client";

import React from "react";
import { Play, Pause, Radio, ChevronRight, Activity } from "lucide-react";
import { MatchSituation } from "@/data/match";

interface MatchHeaderProps {
  matchData?: MatchSituation;
  scoreDisplay?: {
    primary: string;
    primaryLabel: string;
    progress: string;
    progressPercent: number;
    secondaryStatus: string;
  };
  sportName?: string;
  seriesOrLeague?: string;
  teams?: [string, string];
  winProbability?: { team1: number; team2: number };
  onOpenStorySoFar: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export function MatchHeader({
  matchData,
  scoreDisplay,
  sportName = "Cricket",
  seriesOrLeague,
  teams,
  winProbability,
  onOpenStorySoFar,
  isSimulating,
  onToggleSimulation,
}: MatchHeaderProps) {
  const activeTeams = teams || matchData?.teams || ["IND", "AUS"];
  const activeLeague = seriesOrLeague || matchData?.series || "Live Championship";

  const primaryScore = scoreDisplay?.primary || matchData?.score || "112/3";
  const primaryLabel = scoreDisplay?.primaryLabel || activeTeams[0];
  const progressLabel = scoreDisplay?.progress || `${matchData?.overs || "14.2"} / ${matchData?.totalOvers || 20} Overs`;
  const secondaryStatus =
    scoreDisplay?.secondaryStatus ||
    (matchData
      ? `Need ${matchData.runsNeeded} off ${matchData.ballsLeft} balls · RRR ${matchData.requiredRunRate}`
      : "Live match in progress");

  let progressPercent = 70;
  if (scoreDisplay) {
    progressPercent = scoreDisplay.progressPercent;
  } else if (matchData) {
    const currentOverFloat = parseFloat(matchData.overs);
    progressPercent = Math.min(100, Math.max(0, (currentOverFloat / matchData.totalOvers) * 100));
  }

  const wp1 = winProbability?.team1 ?? 64;
  const wp2 = winProbability?.team2 ?? 36;

  return (
    <section className="w-full glass-panel rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
      {/* Top ambient illumination */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Row 1: League & Broadcast Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Live indicator badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px] tracking-wider uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-live-pulse" />
            <span>LIVE</span>
          </div>

          <span className="text-xs font-semibold text-text-muted truncate">
            {activeLeague}
          </span>
        </div>

        {/* Live Match Simulation Toggle */}
        <button
          type="button"
          onClick={onToggleSimulation}
          title={isSimulating ? "Pause live match feed" : "Simulate live match play-by-play"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[32px] shrink-0 ${
            isSimulating
              ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-400 shadow-sm"
              : "bg-surface-raised/80 border-theme text-text-muted hover:text-foreground hover:border-white/20"
          }`}
          aria-label={isSimulating ? "Pause match simulation" : "Simulate live match"}
        >
          {isSimulating ? (
            <>
              <Pause className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>Ticking Live</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-indigo-400" />
              <span>Simulate</span>
            </>
          )}
        </button>
      </div>

      {/* Row 2: Teams & Main Broadcast Scoreboard */}
      <div className="flex items-end justify-between gap-4 pt-1 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {activeTeams[0]} vs {activeTeams[1]}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-foreground">
              {primaryScore}
            </span>
            <span className="text-sm font-bold text-text-muted">
              {primaryLabel}
            </span>
          </div>
        </div>

        <div className="text-right space-y-0.5 shrink-0">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
            {sportName} Status
          </span>
          <span className="text-base sm:text-lg font-bold tabular-nums text-foreground block">
            {progressLabel}
          </span>
        </div>
      </div>

      {/* Progress Bar with neon gradient */}
      <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Row 3: Live Win Probability Bar (Broadcast Style) */}
      <div className="space-y-1.5 bg-black/25 p-3 rounded-2xl border border-white/[0.05]">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-indigo-400 flex items-center gap-1 font-semibold">
            <Activity className="w-3 h-3 text-indigo-400" />
            <span>{activeTeams[0]} {wp1}%</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
            Win Probability
          </span>
          <span className="text-amber-400 font-semibold">
            {wp2}% {activeTeams[1]}
          </span>
        </div>

        <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden border border-white/[0.06] flex">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700 ease-out"
            style={{ width: `${wp1}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 ease-out"
            style={{ width: `${wp2}%` }}
          />
        </div>
      </div>

      {/* Row 4: Chase context line & "Catch me up" Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/[0.06]">
        <p className="text-xs font-medium text-text-muted leading-relaxed">
          {secondaryStatus}
        </p>

        {/* Catch me up story button */}
        <button
          type="button"
          onClick={onOpenStorySoFar}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 cursor-pointer min-h-[40px] shrink-0"
          id="catch-me-up-btn"
          aria-label="Catch me up with the match story so far"
        >
          <Radio className="w-3.5 h-3.5 text-indigo-400" />
          <span>Match Recap</span>
          <ChevronRight className="w-3.5 h-3.5 text-indigo-400/80" />
        </button>
      </div>
    </section>
  );
}
