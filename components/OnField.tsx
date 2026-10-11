"use client";

import React from "react";
import { Player } from "@/data/types";
import { ChevronRight, Info } from "lucide-react";

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

  const s = sportName.toLowerCase();
  const isBasketball = s.includes("basketball");

  if (!label1 || !label2) {
    if (s.includes("cricket")) {
      label1 = "Batting Lineup";
      label2 = "Bowling Attack";
    } else if (s.includes("football") || s.includes("soccer")) {
      label1 = "Real Madrid";
      label2 = "Barcelona";
    } else if (isBasketball) {
      label1 = "Los Angeles Lakers";
      label2 = "Golden State Warriors";
    } else {
      label1 = "Key Starters";
      label2 = "Opponent Rivals";
    }
  }

  let displayGroup1: Player[];
  let displayGroup2: Player[];

  if (isBasketball) {
    displayGroup1 = players.filter((p) => p.id === "lebron-james" || p.id === "austin-reaves");
    displayGroup2 = players.filter((p) => p.id === "stephen-curry" || p.id === "draymond-green");
    if (displayGroup1.length === 0 && displayGroup2.length === 0) {
      displayGroup1 = players.slice(0, Math.ceil(players.length / 2));
      displayGroup2 = players.slice(Math.ceil(players.length / 2));
    }
  } else if (s.includes("football") || s.includes("soccer")) {
    displayGroup1 = players.filter((p) => p.id === "vinicius-jr" || p.id === "jude-bellingham");
    displayGroup2 = players.filter((p) => p.id === "robert-lewandowski" || p.id === "lamine-yamal");
    if (displayGroup1.length === 0 && displayGroup2.length === 0) {
      displayGroup1 = players.slice(0, Math.ceil(players.length / 2));
      displayGroup2 = players.slice(Math.ceil(players.length / 2));
    }
  } else {
    const group1Players = players.filter((p) =>
      ["Batter", "Attacker", "Forward"].includes(p.role)
    );
    const group2Players = players.filter((p) =>
      ["Bowler", "Midfielder", "Defender", "Goalkeeper", "Guard", "Center"].includes(p.role)
    );
    displayGroup1 =
      group1Players.length > 0 ? group1Players : players.slice(0, Math.ceil(players.length / 2));
    displayGroup2 =
      group2Players.length > 0 ? group2Players : players.slice(Math.ceil(players.length / 2));
  }

  const surfaceName = isBasketball ? "Court" : "Pitch";

  return (
    <section className="w-full space-y-4" aria-labelledby="on-field-heading">
      <div className="flex items-center justify-between px-0.5">
        <h2
          id="on-field-heading"
          className="text-xs font-bold uppercase tracking-wider text-muted"
        >
          Active Players on {surfaceName}
        </h2>
        <span className="text-xs font-medium text-muted">
          Tap card for career &amp; tactical intel
        </span>
      </div>

      {players.length === 0 ? (
        <div className="p-4 rounded-2xl glass-panel text-center space-y-1.5 border border-theme">
          <Info className="w-5 h-5 mx-auto text-muted" />
          <p className="text-xs font-semibold text-foreground">No players listed</p>
          <p className="text-xs text-muted">Player lineup data will appear once available.</p>
        </div>
      ) : (
        <>
          {/* Group 1 (e.g. Batters / Attackers) */}
          {displayGroup1.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 pl-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span>{label1}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {displayGroup1.map((player) => {
                  const isStriker = strikerId ? player.id === strikerId : Boolean(player.isStriker);
                  return (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      isStriker={isStriker}
                      sportName={sportName}
                      onSelect={() => onSelectPlayer(player)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2 (e.g. Bowlers / Opponents) */}
          {displayGroup2.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 pl-1">
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
                <span>{label2}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {displayGroup2.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isStriker={false}
                    sportName={sportName}
                    onSelect={() => onSelectPlayer(player)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

interface PlayerCardProps {
  player: Player;
  isStriker?: boolean;
  sportName: string;
  onSelect: () => void;
}

function PlayerCard({ player, isStriker, sportName, onSelect }: PlayerCardProps) {
  const isCricket = sportName.toLowerCase().includes("cricket");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${player.name}, ${player.role}, ${isStriker ? "on strike, " : ""}figures: ${player.onField}. Tap for tactical intro.`}
      className="group w-full min-h-[92px] p-3 rounded-2xl glass-panel-interactive text-left cursor-pointer flex flex-col justify-between relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      {/* Top row: Avatar initials + Name & Strike badge */}
      <div className="flex items-start gap-2.5">
        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-surface-raised border border-theme flex items-center justify-center font-black text-xs text-foreground group-hover:border-indigo-400/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
          {player.avatarInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              {player.name}
            </span>

            {/* Striker / On Strike Indicator */}
            {isStriker && (
              <span
                role="status"
                aria-label={isCricket ? "on strike" : "active attack performer"}
                title={isCricket ? "On strike: facing next delivery" : "Active performer"}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold tracking-tight shrink-0"
              >
                {isCricket ? (
                  <>
                    <span aria-hidden="true" className="text-xs">🏏</span>
                    <span>Strike</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
                    <span>Lead</span>
                  </>
                )}
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-muted truncate block mt-0.5">
            {player.country} · {player.role}
          </span>
        </div>
      </div>

      {/* Bottom row: Figures / Stat line + Action prompt */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-theme">
        <span
          className="text-xs font-extrabold tabular-nums text-foreground tracking-tight truncate max-w-[65%]"
          title={`Current match figures: ${player.onField}`}
        >
          {player.onField}
        </span>
        <span className="text-xs font-semibold text-muted group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center transition-colors shrink-0">
          <span>Tap for intro</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  );
}

