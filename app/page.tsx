"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { MatchHeader } from "@/components/MatchHeader";
import { OnField } from "@/components/OnField";
import { MomentsFeed } from "@/components/MomentsFeed";
import { AskBar } from "@/components/AskBar";
import { BottomSheet, BottomSheetData } from "@/components/BottomSheet";
import {
  match as initialMatchData,
  players as initialPlayers,
  initialEvents,
  storyFallback,
  rulesDictionary,
  simulationSteps,
  Player,
  MatchEvent,
  MatchSituation,
} from "@/data/match";

export default function Home() {
  // Language state (persisted in localStorage)
  const [language, setLanguage] = useState<"en" | "hinglish">("en");

  // Dynamic match state (for live match simulation)
  const [matchData, setMatchData] = useState<MatchSituation>(initialMatchData);
  const [playersList, setPlayersList] = useState<Player[]>(initialPlayers);
  const [eventsList, setEventsList] = useState<MatchEvent[]>(initialEvents);
  const [strikerId, setStrikerId] = useState<string>("hardik-pandya");
  const [recentEventId, setRecentEventId] = useState<string | undefined>(undefined);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationIndex, setSimulationIndex] = useState<number>(0);

  // BottomSheet & AI streaming state
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<BottomSheetData | null>(null);
  const [streamedText, setStreamedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  // In-flight request controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("match-buddy-lang") as "en" | "hinglish" | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Language toggle handler
  const handleLanguageChange = (newLang: "en" | "hinglish") => {
    setLanguage(newLang);
    localStorage.setItem("match-buddy-lang", newLang);

    // If bottom sheet is currently open, re-request explanation in new language
    if (isSheetOpen && sheetData) {
      triggerExplanation(sheetData, newLang);
    }
  };

  // Helper to fetch and stream AI explanation
  const triggerExplanation = useCallback(
    async (data: BottomSheetData, targetLang: "en" | "hinglish") => {
      // Cancel existing in-flight request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setStreamedText("");
      setIsFallback(false);

      // 8-second fallback timeout safeguard
      let receivedFirstToken = false;
      const timeoutId = setTimeout(() => {
        if (!receivedFirstToken && !controller.signal.aborted) {
          console.warn("AI response exceeded 8s threshold; engaging grounded fallback.");
          setIsFallback(true);
          provideFallback(data, targetLang);
        }
      }, 8000);

      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: data.kind,
            id: data.id,
            text: data.queryText,
            language: targetLang,
            matchState: matchData,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server returned error ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (!receivedFirstToken) {
            receivedFirstToken = true;
            clearTimeout(timeoutId);
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamedText(accumulated);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Request intentionally cancelled, do nothing
          return;
        }
        console.warn("AI request error, showing fallback:", err);
        setIsFallback(true);
        provideFallback(data, targetLang);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    },
    [matchData]
  );

  // Fallback text provider using grounded data in data/match.ts
  const provideFallback = (data: BottomSheetData, targetLang: "en" | "hinglish") => {
    let fallback = "";

    if (data.kind === "player" && data.id) {
      const p = playersList.find((player) => player.id === data.id);
      if (p) fallback = p.fallbackIntro[targetLang];
    } else if (data.kind === "event" && data.id) {
      const e = eventsList.find((evt) => evt.id === data.id);
      if (e) fallback = e.fallbackExplain[targetLang];
    } else if (data.kind === "story") {
      fallback = storyFallback[targetLang];
    } else if (data.kind === "question" && data.queryText) {
      const q = data.queryText.toLowerCase();
      for (const [key, val] of Object.entries(rulesDictionary)) {
        if (q.includes(key)) {
          fallback = val[targetLang];
          break;
        }
      }
      if (!fallback) {
        fallback =
          targetLang === "hinglish"
            ? "Network me dikkat lag rahi hai ya AI available nahi hai. Aap Match Buddy se cricket ke anya rules puch sakte hain!"
            : "We couldn't connect to the AI right now. Please check your connection or try another cricket question.";
      }
    }

    setStreamedText(fallback);
  };

  // Open Sheet handlers
  const handleSelectPlayer = (player: Player) => {
    const whyItMatters =
      language === "hinglish"
        ? `Currently batting at ${player.onField} with India needing ${matchData.runsNeeded} from ${matchData.ballsLeft} balls. Unka control game decide karega.`
        : `Currently at ${player.onField} with India requiring ${matchData.runsNeeded} off ${matchData.ballsLeft} balls. This battle dictates the outcome.`;

    const data: BottomSheetData = {
      title: `${player.name} (${player.role})`,
      subtitle: `${player.country} · Formats: ${player.formats.join(", ")}`,
      kind: "player",
      id: player.id,
      whyItMatters,
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language);
  };

  const handleExplainEvent = (event: MatchEvent) => {
    const whyItMatters =
      language === "hinglish"
        ? `Over ${event.over} me ${event.term} hua jisse match ka momentum seedha shift ho gaya.`
        : `Occurred in over ${event.over}, shifting momentum and run-rate demands immediately.`;

    const data: BottomSheetData = {
      title: event.title,
      subtitle: `Over ${event.over} · Rule: ${event.term}`,
      kind: "event",
      id: event.id,
      whyItMatters,
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language);
  };

  const handleAskQuestion = (queryText: string) => {
    const data: BottomSheetData = {
      title: `Rule: "${queryText}"`,
      subtitle: "Match Buddy Rule Breakdown",
      kind: "question",
      queryText,
      whyItMatters:
        language === "hinglish"
          ? "Yeh cricket rule fielders aur batting team dono ke plans ko direct effect karta hai."
          : "Understanding this rule reveals the tactical choices made by captains and fielders.",
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language);
  };

  const handleOpenStorySoFar = () => {
    const data: BottomSheetData = {
      title: "Story of the Match So Far",
      subtitle: "30-Second Innings Summary",
      kind: "story",
      whyItMatters:
        language === "hinglish"
          ? "India ko bas 34 balls me 54 runs chahiye aur required rate 9.5 ka hai."
          : "India are in prime striking distance needing 54 runs from 34 balls.",
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language);
  };

  const handleCloseSheet = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSheetOpen(false);
  };

  // Live match auto-simulation (ticks every 6 seconds)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulationIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % simulationSteps.length;
        const step = simulationSteps[nextIndex];

        // Update match situation
        setMatchData((prev) => ({
          ...prev,
          score: step.score,
          overs: step.overs,
          ballsLeft: step.ballsLeft,
          runsNeeded: step.runsNeeded,
          requiredRunRate: step.requiredRunRate,
        }));

        setStrikerId(step.strikerId);

        // Update player card figures
        setPlayersList((prev) =>
          prev.map((player) => {
            if (step.batterScores[player.id]) {
              return { ...player, onField: step.batterScores[player.id] };
            }
            if (step.bowlerFigures[player.id]) {
              return { ...player, onField: step.bowlerFigures[player.id] };
            }
            return player;
          })
        );

        // Insert new event if step triggers one
        if (step.newEvent) {
          const newEvt = step.newEvent;
          setRecentEventId(newEvt.id);
          setEventsList((prev) => {
            if (prev.some((e) => e.id === newEvt.id)) return prev;
            return [newEvt, ...prev];
          });

          // Clear highlight fade after 3 seconds
          setTimeout(() => {
            setRecentEventId(undefined);
          }, 3000);
        }

        return nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="w-full flex justify-center bg-background min-h-screen text-foreground">
      {/* Centred mobile-first container (max-width 480px on desktop) */}
      <main className="w-full max-w-[480px] min-h-screen flex flex-col bg-background relative border-x border-theme/40 pb-32">
        {/* TopBar with branding, language pill, and theme toggle */}
        <TopBar language={language} onLanguageChange={handleLanguageChange} />

        {/* Main Content Area */}
        <div className="p-4 space-y-5">
          {/* Live Match Card */}
          <MatchHeader
            matchData={matchData}
            onOpenStorySoFar={handleOpenStorySoFar}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating((prev) => !prev)}
          />

          {/* On-Field Players (Batting & Bowling) */}
          <OnField
            players={playersList}
            strikerId={strikerId}
            onSelectPlayer={handleSelectPlayer}
          />

          {/* Match Moments Timeline */}
          <MomentsFeed
            events={eventsList}
            onExplainEvent={handleExplainEvent}
            recentEventId={recentEventId}
          />

          <footer className="pt-6 pb-2 text-center border-t border-theme/60 text-text-muted space-y-1">
            <p className="text-[11px] font-medium">
              Built with ❤️ by <span className="text-foreground font-semibold">Match Buddy</span>
            </p>
            <p className="text-[10px] text-text-muted/80">
              AI answers grounded in verified match facts.
            </p>
          </footer>
        </div>

        {/* Sticky AskBar at Bottom */}
        <AskBar onAskQuestion={handleAskQuestion} isLoading={isLoading} />

        {/* Reusable BottomSheet Modal */}
        <BottomSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          data={sheetData}
          streamedText={streamedText}
          isLoading={isLoading}
          isFallback={isFallback}
          language={language}
        />
      </main>
    </div>
  );
}
