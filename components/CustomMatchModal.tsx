"use client";

import React, { useState } from "react";
import { X, Trophy, Sparkles, Plus } from "lucide-react";
import { SportMatchConfig } from "@/data/sportsData";

interface CustomMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCustomMatch: (matchConfig: SportMatchConfig) => void;
}

export function CustomMatchModal({
  isOpen,
  onClose,
  onCreateCustomMatch,
}: CustomMatchModalProps) {
  const [sportName, setSportName] = useState("Football");
  const [team1, setTeam1] = useState("Manchester United");
  const [team2, setTeam2] = useState("Liverpool");
  const [league, setLeague] = useState("Premier League");
  const [score, setScore] = useState("1 - 2");
  const [status, setStatus] = useState("82' 2nd Half · High Intensity");
  const [player1Name, setPlayer1Name] = useState("Marcus Rashford");
  const [player1Role, setPlayer1Role] = useState("Forward");
  const [player2Name, setPlayer2Name] = useState("Mohamed Salah");
  const [player2Role, setPlayer2Role] = useState("Winger");

  if (!isOpen) return null;

  const popularSports = [
    { name: "Football", icon: "⚽" },
    { name: "Cricket", icon: "🏏" },
    { name: "Basketball", icon: "🏀" },
    { name: "Tennis", icon: "🎾" },
    { name: "Badminton", icon: "🏸" },
    { name: "Hockey", icon: "🏑" },
    { name: "Baseball", icon: "⚾" },
    { name: "NFL / Rugby", icon: "🏈" },
    { name: "UFC / Combat", icon: "🥊" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const t1Short = team1.slice(0, 3).toUpperCase();
    const t2Short = team2.slice(0, 3).toUpperCase();

    const customConfig: SportMatchConfig = {
      id: `custom-${Date.now()}`,
      sportId: "custom",
      sportName,
      sportIcon: popularSports.find((s) => s.name === sportName)?.icon || "🏆",
      matchTitle: `${t1Short} vs ${t2Short}`,
      seriesOrLeague: league,
      teams: [t1Short, t2Short],
      teamFullNames: [team1, team2],
      winProbability: { team1: 52, team2: 48 },
      scoreDisplay: {
        primary: score,
        primaryLabel: `${t1Short} vs ${t2Short}`,
        progress: status,
        progressPercent: 75,
        secondaryStatus: `${team1} vs ${team2} live battle`,
      },
      players: [
        {
          id: `custom-p1-${Date.now()}`,
          name: player1Name,
          role: "Batter",
          onField: "Star Performer",
          country: team1,
          homeState: "Active",
          formats: [sportName],
          isStriker: true,
          avatarInitials: player1Name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P1",
          keyFacts: [`Key star player for ${team1}`, `Crucial asset in this ${league} clash`],
          fallbackIntro: {
            en: `${player1Name} is a top ${player1Role} for ${team1}. Their performance in this match is decisive for the result.`,
            hinglish: `${player1Name} ${team1} ke star player hain aur is match me unka role sabse important hai.`,
          },
        },
        {
          id: `custom-p2-${Date.now()}`,
          name: player2Name,
          role: "Bowler",
          onField: "Impact Player",
          country: team2,
          homeState: "Active",
          formats: [sportName],
          isStriker: false,
          avatarInitials: player2Name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "P2",
          keyFacts: [`Key star player for ${team2}`, `High-impact match winner in ${sportName}`],
          fallbackIntro: {
            en: `${player2Name} is an elite ${player2Role} for ${team2}. Keeping them contained is ${team1}'s biggest priority.`,
            hinglish: `${player2Name} ${team2} ke dangerous player hain jinko rokna ${team1} ke liye challenge hai.`,
          },
        },
      ],
      events: [
        {
          id: `custom-evt-1-${Date.now()}`,
          over: "Live",
          type: "free-hit",
          title: "Key Match Turning Point",
          term: "Match Deciding Play",
          badgeText: "TURNING POINT",
          badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          fallbackExplain: {
            en: `A critical tactical moment in ${sportName} that shifts momentum between ${team1} and ${team2}.`,
            hinglish: `${team1} aur ${team2} ke beech ka yeh moment match ka decisive turning point hai.`,
          },
        },
      ],
      storyFallback: {
        en: `${team1} and ${team2} are locked in a fierce ${sportName} duel in ${league}. With the score at ${score}, the final minutes will dictate the winner.`,
        hinglish: `${team1} aur ${team2} ke beech ${league} me kaante ki takkar ho rahi hai. Current score ${score} hai aur game kisi bhi taraf ja sakta hai.`,
      },
      quickQuestions: [
        `Rules of ${sportName}?`,
        `Who has momentum right now?`,
        `Why is this match important?`,
      ],
      rulesDictionary: {},
    };

    onCreateCustomMatch(customConfig);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-match-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-theme rounded-2xl p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-theme/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-ai/15 border border-accent-ai/30 flex items-center justify-center text-accent-ai">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="custom-match-title" className="text-base font-bold text-foreground">
                Follow Any Sport &amp; Team
              </h2>
              <p className="text-xs text-text-muted">
                Create a live companion for any match
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-raised cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Quick Sport Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Select or Enter Sport
            </label>
            <div className="flex flex-wrap gap-1.5">
              {popularSports.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSportName(s.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                    sportName.toLowerCase() === s.name.toLowerCase()
                      ? "bg-accent-ai text-white border-accent-ai"
                      : "bg-surface-raised border-theme text-text-muted hover:text-foreground"
                  }`}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={sportName}
              onChange={(e) => setSportName(e.target.value)}
              placeholder="e.g. Volleyball, Golf, Badminton..."
              required
              className="w-full h-9 px-3 rounded-xl bg-surface-raised border border-theme text-foreground text-xs focus:ring-2 focus:ring-accent-ai"
            />
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-text-muted">
                Team 1 (or Player 1)
              </label>
              <input
                type="text"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                placeholder="e.g. Man United"
                required
                className="w-full h-9 px-3 rounded-xl bg-surface-raised border border-theme text-foreground text-xs focus:ring-2 focus:ring-accent-ai"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-text-muted">
                Team 2 (or Player 2)
              </label>
              <input
                type="text"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                placeholder="e.g. Liverpool"
                required
                className="w-full h-9 px-3 rounded-xl bg-surface-raised border border-theme text-foreground text-xs focus:ring-2 focus:ring-accent-ai"
              />
            </div>
          </div>

          {/* Tournament & Score */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-text-muted">
                League / Tournament
              </label>
              <input
                type="text"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                placeholder="e.g. Premier League"
                className="w-full h-9 px-3 rounded-xl bg-surface-raised border border-theme text-foreground text-xs focus:ring-2 focus:ring-accent-ai"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-text-muted">
                Score
              </label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 1 - 2 or 21-19"
                className="w-full h-9 px-3 rounded-xl bg-surface-raised border border-theme text-foreground text-xs focus:ring-2 focus:ring-accent-ai"
              />
            </div>
          </div>

          {/* Key Players */}
          <div className="p-3 rounded-xl bg-surface-raised/50 border border-theme space-y-2">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
              Key Players to Track
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1 Name"
                className="h-8 px-2.5 rounded-lg bg-surface border border-theme text-foreground text-xs"
              />
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2 Name"
                className="h-8 px-2.5 rounded-lg bg-surface border border-theme text-foreground text-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-accent-ai hover:bg-accent-ai/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Match Companion</span>
          </button>
        </form>
      </div>
    </div>
  );
}
