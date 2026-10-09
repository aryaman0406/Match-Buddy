"use client";

import React from "react";
import { Player } from "@/data/match";

interface OnFieldProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  strikerId?: string;
  sportName?: string;
  group1Label?: string;
  group2Label?: string;
}

export function OnField({
  players,
  onSelectPlayer,
  strikerId,
  sportName = "Cricket",
  group1Label,
  group2Label,
}: OnFieldProps) {
  // Determine dynamic section labels based on sport
  let label1 = group1Label;
  let label2 = group2Label;

  if (!label1 || !label2) {
    const s = sportName.toLowerCase();
    if (s.includes("cricket")) {
      label1 = "Batting 🏏";
      label2 = "Bowling 🎯";
    } else if (s.includes("football") || s.includes("soccer")) {
      label1 = "Attackers & Creators ⚽";
      label2 = "Rival Stars 🛡️";
    } else if (s.includes("basketball")) {
      label1 = "Scorers & Playmakers 🏀";
      label2 = "Rival Stars 🎯";
    } else if (s.includes("tennis")) {
      label1 = "Active Player 🎾";
      label2 = "Opponent 🏆";
    } else if (s.includes("formula") || s.includes("f1")) {
      label1 = "Race Leader 🏎️";
      label2 = "Chasers 🏁";
    } else if (s.includes("kabaddi")) {
      label1 = "Raiders 🤼";
      label2 = "Defenders 🛡️";
    } else {
      label1 = "Key Starters ⭐";
      label2 = "Opponent Contenders 🎯";
    }
  }

  const group1Players = players.filter((p) => p.role === "Batter");
  const group2Players = players.filter((p) => p.role === "Bowler");

  // Fallback if players aren't strictly separated into Batter/Bowler
  const displayGroup1 = group1Players.length > 0 ? group1Players : players.slice(0, Math.ceil(players.length / 2));
  const displayGroup2 = group2Players.length > 0 ? group2Players : players.slice(Math.ceil(players.length / 2));

  return (
    <section className="w-full space-y-4" aria-labelledby="on-field-heading">
      <div className="flex items-center justify-between">
        <h2
          id="on-field-heading"
          className="text-[13px] font-semibold uppercase tracking-wider text-text-muted"
        >
          Key Players on Field
        </h2>
        <span className="text-[11px] text-text-muted">Tap any player for AI intro</span>
      </div>

      {/* Group 1 Section */}
      {displayGroup1.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 pl-1">
            <span>{label1}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {displayGroup1.map((player) => {
              const isStriker = strikerId ? player.id === strikerId : player.isStriker;
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isStriker={isStriker}
                  onSelect={() => onSelectPlayer(player)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Group 2 Section */}
      {displayGroup2.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 pl-1">
            <span>{label2}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {displayGroup2.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isStriker={false}
                onSelect={() => onSelectPlayer(player)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface PlayerCardProps {
  player: Player;
  isStriker?: boolean;
  onSelect: () => void;
}

function PlayerCard({ player, isStriker, onSelect }: PlayerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${player.name}, ${player.role}, score: ${player.onField}. Tap for AI intro`}
      className="group w-full min-h-[76px] p-3 rounded-2xl bg-surface border border-theme hover:border-accent-ai/50 text-left transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent-ai cursor-pointer flex flex-col justify-between shadow-sm relative overflow-hidden"
    >
      {/* Top subtle highlight gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-ai/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-center gap-2.5 relative z-10">
        {/* Avatar circle with initials */}
        <div className="w-10 h-10 min-w-[40px] rounded-full bg-surface-raised border border-theme flex items-center justify-center font-bold text-xs text-foreground group-hover:border-accent-ai/60 group-hover:text-accent-ai transition-colors">
          {player.avatarInitials}
        </div>

        {/* Player Name & Role */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-foreground truncate group-hover:text-accent-ai transition-colors">
              {player.name}
            </span>
            {isStriker && (
              <span
                title="Active Performer"
                className="text-xs px-1 rounded bg-amber-500/20 text-amber-400 font-bold"
                aria-label="Active"
              >
                ★
              </span>
            )}
          </div>
          <span className="text-[11px] text-text-muted block truncate">
            {player.country} · {player.role}
          </span>
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme/50 relative z-10">
        <span className="text-xs font-bold tabular-nums text-foreground truncate max-w-[120px]">
          {player.onField}
        </span>
        <span className="text-[10px] font-medium text-text-muted group-hover:text-accent-ai flex items-center gap-0.5 transition-colors shrink-0">
          Tap for intro →
        </span>
      </div>
    </button>
  );
}
