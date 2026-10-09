"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { MatchHeader } from "@/components/MatchHeader";
import { OnField } from "@/components/OnField";
import { MomentsFeed } from "@/components/MomentsFeed";
import { AskBar } from "@/components/AskBar";
import { BottomSheet, BottomSheetData } from "@/components/BottomSheet";
import { SportSelector } from "@/components/SportSelector";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { CustomMatchModal } from "@/components/CustomMatchModal";
import { allSportsMatches, SportMatchConfig } from "@/data/sportsData";
import {
  match as initialMatchData,
  players as initialPlayers,
  initialEvents,
  simulationSteps,
  Player,
  MatchEvent,
  MatchSituation,
} from "@/data/match";

export default function Home() {
  // Language state (persisted in localStorage)
  const [language, setLanguage] = useState<"en" | "hinglish">("en");

  // Gemini API Key state (persisted in localStorage)
  const [geminiKey, setGeminiKey] = useState<string>("");
  const [geminiModel, setGeminiModel] = useState<string>("gemini-2.0-flash");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Active Sport & Match state
  const [currentMatch, setCurrentMatch] = useState<SportMatchConfig>(allSportsMatches[0]);
  const [customMatches, setCustomMatches] = useState<SportMatchConfig[]>([]);
  const [isCustomMatchModalOpen, setIsCustomMatchModalOpen] = useState<boolean>(false);

  // Live match state
  const [matchData, setMatchData] = useState<MatchSituation>(initialMatchData);
  const [scoreDisplay, setScoreDisplay] = useState(allSportsMatches[0].scoreDisplay);
  const [playersList, setPlayersList] = useState<Player[]>(allSportsMatches[0].players);
  const [eventsList, setEventsList] = useState<MatchEvent[]>(allSportsMatches[0].events);
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

  // Load saved language, Gemini key, and custom matches on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("match-buddy-lang") as "en" | "hinglish" | null;
    if (savedLang) setLanguage(savedLang);

    const savedKey = localStorage.getItem("match-buddy-gemini-key") || "";
    if (savedKey) setGeminiKey(savedKey);

    const savedModel = localStorage.getItem("match-buddy-gemini-model") || "gemini-2.0-flash";
    setGeminiModel(savedModel);

    try {
      const savedCustom = localStorage.getItem("match-buddy-custom-matches");
      if (savedCustom) {
        setCustomMatches(JSON.parse(savedCustom));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save Gemini Key handler
  const handleSaveGeminiKey = (key: string, model: string) => {
    setGeminiKey(key);
    setGeminiModel(model);
    localStorage.setItem("match-buddy-gemini-key", key);
    localStorage.setItem("match-buddy-gemini-model", model);
  };

  const handleClearGeminiKey = () => {
    setGeminiKey("");
    localStorage.removeItem("match-buddy-gemini-key");
  };

  // Language toggle handler
  const handleLanguageChange = (newLang: "en" | "hinglish") => {
    setLanguage(newLang);
    localStorage.setItem("match-buddy-lang", newLang);

    if (isSheetOpen && sheetData) {
      triggerExplanation(sheetData, newLang, currentMatch);
    }
  };

  // Switch sport / match handler
  const handleSelectMatch = (selected: SportMatchConfig) => {
    setIsSimulating(false);
    setCurrentMatch(selected);
    setScoreDisplay(selected.scoreDisplay);
    setPlayersList(selected.players);
    setEventsList(selected.events);
    setStrikerId(selected.players[0]?.id || "");

    // If cricket, sync cricket matchData
    if (selected.sportId === "cricket") {
      setMatchData(initialMatchData);
    }
  };

  // Create custom match handler
  const handleCreateCustomMatch = (newMatch: SportMatchConfig) => {
    const updated = [newMatch, ...customMatches];
    setCustomMatches(updated);
    try {
      localStorage.setItem("match-buddy-custom-matches", JSON.stringify(updated));
    } catch {
      // ignore storage error
    }
    handleSelectMatch(newMatch);
  };

  // Fallback text provider using grounded data in active match config
  const provideFallback = (
    data: BottomSheetData,
    targetLang: "en" | "hinglish",
    activeMatch: SportMatchConfig
  ) => {
    let fallback = "";

    if (data.kind === "player" && data.id) {
      const p = activeMatch.players.find((player) => player.id === data.id);
      if (p) {
        fallback = p.fallbackIntro[targetLang];
      } else {
        fallback =
          targetLang === "hinglish"
            ? `${data.title} ${activeMatch.sportName} ke match me key role play kar rahe hain.`
            : `${data.title} is playing a crucial role in this ${activeMatch.sportName} clash.`;
      }
    } else if (data.kind === "event" && data.id) {
      const e = activeMatch.events.find((evt) => evt.id === data.id);
      if (e) {
        fallback = e.fallbackExplain[targetLang];
      } else {
        fallback =
          targetLang === "hinglish"
            ? `${data.title} is match ka key moment hai jo match momentum ko direct effect karta hai.`
            : `${data.title} is a key match moment dictating current momentum.`;
      }
    } else if (data.kind === "story") {
      fallback = activeMatch.storyFallback[targetLang];
    } else if (data.kind === "question" && data.queryText) {
      const q = data.queryText.toLowerCase();
      for (const [key, val] of Object.entries(activeMatch.rulesDictionary)) {
        if (q.includes(key)) {
          fallback = val[targetLang];
          break;
        }
      }
      if (!fallback) {
        fallback =
          targetLang === "hinglish"
            ? `Yeh ${activeMatch.sportName} ka ek important concept hai. Match Buddy AI se aap kisi bhi rule ya player ke baare me pooch sakte hain!`
            : `This is a key tactical concept in ${activeMatch.sportName}. Feel free to ask Match Buddy about any player, team, or rule!`;
      }
    }

    setStreamedText(fallback);
  };

  // Trigger AI explanation
  const triggerExplanation = useCallback(
    async (
      data: BottomSheetData,
      targetLang: "en" | "hinglish",
      activeMatch: SportMatchConfig = currentMatch
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setStreamedText("");
      setIsFallback(false);

      let receivedFirstToken = false;
      const timeoutId = setTimeout(() => {
        if (!receivedFirstToken && !controller.signal.aborted) {
          console.warn("AI response exceeded 8s threshold; engaging grounded fallback.");
          setIsFallback(true);
          provideFallback(data, targetLang, activeMatch);
        }
      }, 8000);

      try {
        const matchSummary = `${activeMatch.teamFullNames.join(" vs ")} (${activeMatch.seriesOrLeague}). Score: ${scoreDisplay.primary} (${scoreDisplay.progress}). ${scoreDisplay.secondaryStatus}`;

        // Find associated player or event object for rich context
        const selectedPlayer = activeMatch.players.find((p) => p.id === data.id);
        const selectedEvent = activeMatch.events.find((e) => e.id === data.id);

        const response = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(geminiKey ? { "x-gemini-key": geminiKey, "x-gemini-model": geminiModel } : {}),
          },
          body: JSON.stringify({
            kind: data.kind,
            id: data.id,
            text: data.queryText,
            language: targetLang,
            sport: activeMatch.sportName,
            matchState: matchSummary,
            geminiApiKey: geminiKey,
            geminiModel: geminiModel,
            playerData: selectedPlayer
              ? {
                  name: selectedPlayer.name,
                  role: selectedPlayer.role,
                  onField: selectedPlayer.onField,
                  country: selectedPlayer.country,
                  team: selectedPlayer.country,
                  keyFacts: selectedPlayer.keyFacts,
                  fallbackIntro: selectedPlayer.fallbackIntro,
                }
              : undefined,
            eventData: selectedEvent
              ? {
                  title: selectedEvent.title,
                  term: selectedEvent.term,
                  over: selectedEvent.over,
                  fallbackExplain: selectedEvent.fallbackExplain,
                }
              : undefined,
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
          return;
        }
        console.warn("AI request error, showing fallback:", err);
        setIsFallback(true);
        provideFallback(data, targetLang, activeMatch);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    },
    [currentMatch, geminiKey, geminiModel, scoreDisplay]
  );

  // Open Sheet handlers
  const handleSelectPlayer = (player: Player) => {
    const whyItMatters =
      language === "hinglish"
        ? `${player.name} (${player.onField}) ki presence match ke is point par sabse crucial hai.`
        : `${player.name} (${player.onField}) holds the key to this match situation right now.`;

    const data: BottomSheetData = {
      title: `${player.name} (${player.role})`,
      subtitle: `${player.country} · ${currentMatch.sportName}`,
      kind: "player",
      id: player.id,
      whyItMatters,
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language, currentMatch);
  };

  const handleExplainEvent = (event: MatchEvent) => {
    const whyItMatters =
      language === "hinglish"
        ? `${event.title} (${event.term}) ne match ke balance ko seedha badla hai.`
        : `${event.title} (${event.term}) shifted the strategic momentum of the game.`;

    const data: BottomSheetData = {
      title: event.title,
      subtitle: `${event.over} · Rule: ${event.term}`,
      kind: "event",
      id: event.id,
      whyItMatters,
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language, currentMatch);
  };

  const handleAskQuestion = (queryText: string) => {
    const data: BottomSheetData = {
      title: `"${queryText}"`,
      subtitle: `${currentMatch.sportName} Companion Breakdown`,
      kind: "question",
      queryText,
      whyItMatters:
        language === "hinglish"
          ? "Iss sports rule ya sawaal ka seedha asar team ki strategy par padta hai."
          : "Understanding this concept unlocks the decisions made by players and coaches.",
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language, currentMatch);
  };

  const handleOpenStorySoFar = () => {
    const data: BottomSheetData = {
      title: `Story of ${currentMatch.matchTitle} So Far`,
      subtitle: `${currentMatch.sportName} Match Summary`,
      kind: "story",
      whyItMatters:
        language === "hinglish"
          ? `Current score: ${scoreDisplay.primary}. ${scoreDisplay.secondaryStatus}`
          : `Current situation: ${scoreDisplay.primary}. ${scoreDisplay.secondaryStatus}`,
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language, currentMatch);
  };

  const handleCloseSheet = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSheetOpen(false);
  };

  // Live match auto-simulation (ticks every 6s for cricket demo)
  useEffect(() => {
    if (!isSimulating || currentMatch.sportId !== "cricket") return;

    const interval = setInterval(() => {
      setSimulationIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % simulationSteps.length;
        const step = simulationSteps[nextIndex];

        setMatchData((prev) => ({
          ...prev,
          score: step.score,
          overs: step.overs,
          ballsLeft: step.ballsLeft,
          runsNeeded: step.runsNeeded,
          requiredRunRate: step.requiredRunRate,
        }));

        setScoreDisplay({
          primary: step.score,
          primaryLabel: "IND",
          progress: `${step.overs} / 20 Overs`,
          progressPercent: Math.min(100, (parseFloat(step.overs) / 20) * 100),
          secondaryStatus: `Need ${step.runsNeeded} off ${step.ballsLeft} balls · RRR ${step.requiredRunRate}`,
        });

        setStrikerId(step.strikerId);

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

        if (step.newEvent) {
          const newEvt = step.newEvent;
          setRecentEventId(newEvt.id);
          setEventsList((prev) => {
            if (prev.some((e) => e.id === newEvt.id)) return prev;
            return [newEvt, ...prev];
          });

          setTimeout(() => {
            setRecentEventId(undefined);
          }, 3000);
        }

        return nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isSimulating, currentMatch]);

  return (
    <div className="w-full flex justify-center bg-background min-h-screen text-foreground">
      {/* Mobile-first container (max-width 480px on desktop) */}
      <main className="w-full max-w-[480px] min-h-screen flex flex-col bg-background relative border-x border-theme/40 pb-36">
        {/* TopBar with branding, Gemini Key button, language toggle, and theme */}
        <TopBar
          language={language}
          onLanguageChange={handleLanguageChange}
          hasGeminiKey={Boolean(geminiKey)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          currentSportIcon={currentMatch.sportIcon}
        />

        {/* Multi-Sport Selector Bar */}
        <div className="px-3 pt-2.5">
          <SportSelector
            currentMatchId={currentMatch.id}
            onSelectMatch={handleSelectMatch}
            onOpenCustomMatch={() => setIsCustomMatchModalOpen(true)}
            customMatches={customMatches}
          />
        </div>

        {/* Main Content Area */}
        <div className="p-3.5 sm:p-4 space-y-4">
          {/* Live Match Card */}
          <MatchHeader
            matchData={matchData}
            scoreDisplay={scoreDisplay}
            sportName={currentMatch.sportName}
            seriesOrLeague={currentMatch.seriesOrLeague}
            teams={currentMatch.teams}
            onOpenStorySoFar={handleOpenStorySoFar}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating((prev) => !prev)}
          />

          {/* On-Field Players for the active sport */}
          <OnField
            players={playersList}
            strikerId={strikerId}
            onSelectPlayer={handleSelectPlayer}
            sportName={currentMatch.sportName}
          />

          {/* Match Moments Timeline */}
          <MomentsFeed
            events={eventsList}
            onExplainEvent={handleExplainEvent}
            recentEventId={recentEventId}
          />

          <footer className="pt-6 pb-2 text-center border-t border-theme/60 text-text-muted space-y-1">
            <p className="text-[11px] font-medium">
              Powered by <span className="text-foreground font-semibold">Google Gemini AI</span> &amp; Match Buddy
            </p>
            <p className="text-[10px] text-text-muted/80">
              Works for any sport, any team, and casual fan explanations.
            </p>
          </footer>
        </div>

        {/* Sticky AskBar at Bottom */}
        <AskBar
          onAskQuestion={handleAskQuestion}
          isLoading={isLoading}
          quickChips={currentMatch.quickQuestions}
          placeholder={`Ask about ${currentMatch.sportName}, ${currentMatch.teamFullNames[0]} vs ${currentMatch.teamFullNames[1]}...`}
        />

        {/* BottomSheet Modal for AI Answers */}
        <BottomSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          data={sheetData}
          streamedText={streamedText}
          isLoading={isLoading}
          isFallback={isFallback}
          language={language}
        />

        {/* Gemini API Key Modal */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          geminiKey={geminiKey}
          geminiModel={geminiModel}
          onSaveKey={handleSaveGeminiKey}
          onClearKey={handleClearGeminiKey}
        />

        {/* Custom Match Modal */}
        <CustomMatchModal
          isOpen={isCustomMatchModalOpen}
          onClose={() => setIsCustomMatchModalOpen(false)}
          onCreateCustomMatch={handleCreateCustomMatch}
        />
      </main>
    </div>
  );
}
