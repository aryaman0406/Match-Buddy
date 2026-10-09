"use client";

import React from "react";
import { Player } from "@/data/match";
import { ChevronRight } from "lucide-react";

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
  let label1 = group1Label;
  let label2 = group2Label;

  if (!label1 || !label2) {
    const s = sportName.toLowerCase();
    if (s.includes("cricket")) {
      label1 = "Batting Lineup";
      label2 = "Bowling Attack";
    } else if (s.includes("football") || s.includes("soccer")) {
      label1 = "Attackers & Playmakers";
      label2 = "Opponent Defense & Key Rivals";
    } else if (s.includes("basketball")) {
      label1 = "On-Court Scorers";
      label2 = "Opponent Key Rivals";
    } else if (s.includes("tennis")) {
      label1 = "Serving Player";
      label2 = "Receiving Player";
    } else if (s.includes("formula") || s.includes("f1")) {
      label1 = "Race Leader";
      label2 = "Chasing Contenders";
    } else if (s.includes("kabaddi")) {
      label1 = "Raiders";
      label2 = "Defenders";
    } else {
      label1 = "Key Starters";
      label2 = "Opponent Rivals";
    }
  }

  const group1Players = players.filter((p) => p.role === "Batter");
  const group2Players = players.filter((p) => p.role === "Bowler");

  const displayGroup1 = group1Players.length > 0 ? group1Players : players.slice(0, Math.ceil(players.length / 2));
  const displayGroup2 = group2Players.length > 0 ? group2Players : players.slice(Math.ceil(players.length / 2));

  return (
    <section className="w-full space-y-4" aria-labelledby="on-field-heading">
      <div className="flex items-center justify-between px-0.5">
        <h2
          id="on-field-heading"
          className="text-xs font-bold uppercase tracking-wider text-text-muted"
        >
          Active Players on Pitch
        </h2>
        <span className="text-[11px] font-medium text-text-muted">
          Tap card for career &amp; tactical intel
        </span>
      </div>

      {/* Group 1 */}
      {displayGroup1.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted/80 flex items-center gap-1.5 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
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

      {/* Group 2 */}
      {displayGroup2.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted/80 flex items-center gap-1.5 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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
      aria-label={`${player.name}, ${player.role}, score: ${player.onField}. View tactical intel`}
      className="group w-full min-h-[82px] p-3 rounded-2xl glass-panel-interactive text-left cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top row: Avatar initials + Name & Country */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 min-w-[36px] rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-black text-xs text-foreground group-hover:border-indigo-400/50 group-hover:text-indigo-400 transition-colors shrink-0">
          {player.avatarInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm text-foreground truncate group-hover:text-indigo-300 transition-colors">
              {player.name}
            </span>
            {isStriker && (
              <span
                title="Active Performer"
                className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                aria-label="Active performer"
              />
            )}
          </div>
          <span className="text-[10px] font-semibold text-text-muted truncate block">
            {player.country} · {player.role}
          </span>
        </div>
      </div>

      {/* Bottom row: Stat line + subtle arrow */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
        <span className="text-xs font-black tabular-nums text-foreground tracking-tight">
          {player.onField}
        </span>
        <span className="text-[10px] font-semibold text-text-muted group-hover:text-indigo-400 flex items-center transition-colors">
          <span>Intel</span>
          <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  );
}
