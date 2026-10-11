"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { TopBar, PersonaMode } from "@/components/TopBar";
import { MatchHeader } from "@/components/MatchHeader";
import { OnField } from "@/components/OnField";
import { MomentsFeed } from "@/components/MomentsFeed";
import { AskBar } from "@/components/AskBar";
import { BottomSheet, BottomSheetData } from "@/components/BottomSheet";
import { SportSelector } from "@/components/SportSelector";
import { defaultMatchProvider } from "@/data/provider";
import { SportMatchConfig, Player, MatchEvent } from "@/data/types";
import { calculateCricketWinProbability } from "@/lib/winProbability";
import { speakText, stopSpeech, isSpeechSupported } from "@/lib/speech";
import { X, Sparkles, AlertCircle, Volume2, VolumeX, Lightbulb, CheckCircle } from "lucide-react";

const emptySubscribe = () => () => {};

export default function Home() {
  const allMatches = defaultMatchProvider.getAllMatches();

  // Language & Persona state with lazy initialization from localStorage
  const [language, setLanguage] = useState<"en" | "hinglish">(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("match-buddy-lang") as "en" | "hinglish" | null;
      if (savedLang) return savedLang;
    }
    return "en";
  });

  const [persona, setPersona] = useState<PersonaMode>(() => {
    if (typeof window !== "undefined") {
      const savedPersona = localStorage.getItem("match-buddy-persona") as PersonaMode | null;
      if (savedPersona) return savedPersona;
    }
    return "casual";
  });

  // First-visit Tip Banner state (persisted choice)
  const [showTipBanner, setShowTipBanner] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("match-buddy-banner-dismissed");
    }
    return true;
  });

  // Active Sport & Match state (from MatchDataProvider)
  const [currentMatch, setCurrentMatch] = useState<SportMatchConfig>(allMatches[0]);

  // Live match score, probabilities & players
  const [scoreDisplay, setScoreDisplay] = useState(allMatches[0].scoreDisplay);
  const [winProbability, setWinProbability] = useState(allMatches[0].winProbability);
  const [playersList, setPlayersList] = useState<Player[]>(allMatches[0].players);
  const [eventsList, setEventsList] = useState<MatchEvent[]>(allMatches[0].events);
  const [strikerId, setStrikerId] = useState<string>("hardik-pandya");
  const [recentEventId, setRecentEventId] = useState<string | undefined>(undefined);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [, setSimulationIndex] = useState<number>(0);

  // BottomSheet & AI streaming state
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<BottomSheetData | null>(null);
  const [streamedText, setStreamedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [reviewLabel, setReviewLabel] = useState<string | null>(null);

  // Speech state for desktop panel
  const [isSpeakingDesktop, setIsSpeakingDesktop] = useState(false);
  const speechSupported = useSyncExternalStore(
    emptySubscribe,
    () => isSpeechSupported(),
    () => false
  );

  // In-flight request controller & timeout tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const recentEventTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop active speech synthesis, abort in-flight requests, and clear timers on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (recentEventTimeoutRef.current) {
        clearTimeout(recentEventTimeoutRef.current);
      }
    };
  }, []);

  const handleDismissBanner = () => {
    setShowTipBanner(false);
    localStorage.setItem("match-buddy-banner-dismissed", "true");
  };

  const handlePersonaChange = (p: PersonaMode) => {
    setPersona(p);
    localStorage.setItem("match-buddy-persona", p);
    if (isSheetOpen && sheetData) {
      triggerExplanation(sheetData, language, currentMatch, p);
    }
  };

  const handleLanguageChange = (newLang: "en" | "hinglish") => {
    // Cancel any current in-flight streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLanguage(newLang);
    localStorage.setItem("match-buddy-lang", newLang);

    if (isSheetOpen && sheetData) {
      triggerExplanation(sheetData, newLang, currentMatch, persona);
    }
  };

  // Switch sport / match handler (consumes MatchDataProvider)
  const handleSelectMatch = (selected: SportMatchConfig) => {
    // Cancel in-flight requests and speech on sport switch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (recentEventTimeoutRef.current) {
      clearTimeout(recentEventTimeoutRef.current);
      recentEventTimeoutRef.current = null;
    }
    setRecentEventId(undefined);
    stopSpeech();
    setIsSpeakingDesktop(false);
    setIsSheetOpen(false);
    setSheetData(null);
    setStreamedText("");
    setIsSimulating(false);
    setSimulationIndex(0);
    setCurrentMatch(selected);
    setScoreDisplay(selected.scoreDisplay);
    setWinProbability(selected.winProbability);
    setPlayersList(selected.players);
    setEventsList(selected.events);
    setStrikerId(selected.players[0]?.id || "");
  };

  // Auto-close BottomSheet when resizing to desktop (>=1024px) to prevent body scroll lock
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && isSheetOpen) {
        setIsSheetOpen(false);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [isSheetOpen]);

  // Synchronize document lang attribute with active language state
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language === "hinglish" ? "hi-Latn" : "en";
    }
  }, [language]);

  // Provide deterministic grounded fallback when AI service is unavailable or timed out
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
        // Friendly retry message for arbitrary free-text questions with no saved rule
        fallback =
          targetLang === "hinglish"
            ? "Abhi hum AI companion se connect nahi kar paaye. Kripya thodi der baad dobara koshish karein ya neeche diye gaye suggest kiye hue rules par tap karein!"
            : "We couldn't reach the AI companion right now. Please try again in a moment or tap one of the suggested rules below!";
      }
    }

    setStreamedText(fallback);
  };

  // Trigger AI explanation with strict 10s timeout, abort controller, and fallback safety
  const triggerExplanation = useCallback(
    async (
      data: BottomSheetData,
      targetLang: "en" | "hinglish",
      activeMatch: SportMatchConfig = currentMatch,
      activePersona: PersonaMode = persona
    ) => {
      // 1. Stop any ongoing speech
      stopSpeech();
      setIsSpeakingDesktop(false);

      // Cancel previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setStreamedText("");
      setIsFallback(false);
      setReviewLabel(null);

      let receivedFirstToken = false;

      // 2. Strict 10-second timeout safeguard
      const timeoutId = setTimeout(() => {
        if (!receivedFirstToken && !controller.signal.aborted) {
          controller.abort();
          setIsFallback(true);
          provideFallback(data, targetLang, activeMatch);
          setIsLoading(false);
        }
      }, 10000);

      try {
        const matchSummary = `${activeMatch.teamFullNames.join(" vs ")} (${activeMatch.seriesOrLeague}). Score: ${scoreDisplay.primary} (${scoreDisplay.progress}). ${scoreDisplay.secondaryStatus}`;

        const selectedPlayer = activeMatch.players.find((p) => p.id === data.id);
        const selectedEvent = activeMatch.events.find((e) => e.id === data.id);

        const response = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kind: data.kind,
            id: data.id,
            text: data.queryText,
            language: targetLang,
            persona: activePersona,
            sport: activeMatch.sportName,
            matchContext: matchSummary,
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
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const reviewHeader = response.headers.get("X-Review-Label");
        if (reviewHeader) {
          setReviewLabel(reviewHeader);
        }
        const sourceHeader = response.headers.get("X-Source");
        if (sourceHeader === "fallback") {
          setIsFallback(true);
        }

        if (!response.body) {
          throw new Error("No response stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || controller.signal.aborted) break;

          if (!receivedFirstToken) {
            receivedFirstToken = true;
            clearTimeout(timeoutId);
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          if (!controller.signal.aborted) {
            setStreamedText(accumulated);
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        // Graceful fallback on error, 429, 503, or timeout
        setIsFallback(true);
        setReviewLabel(null);
        provideFallback(data, targetLang, activeMatch);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    },
    [currentMatch, persona, scoreDisplay]
  );

  // Sheet openers
  const handleSelectPlayer = (player: Player) => {
    const whyItMatters =
      language === "hinglish"
        ? `${player.name} (${player.onField}) score ${scoreDisplay.primary} (${scoreDisplay.progress}) par game control kar rahe hain.`
        : `${player.name} (${player.onField}) is in action with the score at ${scoreDisplay.primary} (${scoreDisplay.progress}).`;

    const data: BottomSheetData = {
      title: `${player.name} (${player.role})`,
      subtitle: `${player.country} · ${currentMatch.sportName}`,
      kind: "player",
      id: player.id,
      whyItMatters,
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language, currentMatch, persona);
  };

  const handleExplainEvent = (event: MatchEvent) => {
    const whyItMatters =
      language === "hinglish"
        ? `${event.title} (${event.term}) ne match momentum ko shift kiya hai.`
        : `${event.title} (${event.term}) shifted the tactical momentum of the contest.`;

    const catLabel = event.category
      ? event.category.charAt(0).toUpperCase() + event.category.slice(1)
      : "Rule";

    const data: BottomSheetData = {
      title: event.title,
      subtitle: `${event.over} · ${catLabel}: ${event.term}`,
      kind: "event",
      id: event.id,
      whyItMatters,
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language, currentMatch, persona);
  };

  const handleAskQuestion = (queryText: string) => {
    const data: BottomSheetData = {
      title: `"${queryText}"`,
      subtitle: `${currentMatch.sportName} Companion Breakdown`,
      kind: "question",
      queryText,
      whyItMatters:
        language === "hinglish"
          ? "Iss sports concept ka seedha asar team ki strategy aur score par padta hai."
          : "Understanding this concept unlocks the tactical decisions made on the pitch.",
    };

    setSheetData(data);
    setIsSheetOpen(true);
    triggerExplanation(data, language, currentMatch, persona);
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
    triggerExplanation(data, language, currentMatch, persona);
  };

  const handleCloseSheet = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopSpeech();
    setIsSpeakingDesktop(false);
    setIsSheetOpen(false);
  };

  // Auto-load striker intro on initial page load
  const hasAutoLoadedStriker = useRef(false);
  useEffect(() => {
    if (!hasAutoLoadedStriker.current) {
      hasAutoLoadedStriker.current = true;
      const striker = currentMatch.players.find((p) => p.isStriker) || currentMatch.players[0];
      if (striker) {
        const timer = setTimeout(() => {
          handleSelectPlayer(striker);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live match auto-simulation (deterministic probability updates)
  useEffect(() => {
    if (!isSimulating) return;

    const steps = currentMatch.simulationSequence || [];
    if (steps.length === 0) return;

    const interval = setInterval(() => {
      setSimulationIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % steps.length;
        const step = steps[nextIndex];

        setScoreDisplay({
          primary: step.scorePrimary,
          primaryLabel: currentMatch.teams[0],
          progress: step.progressText,
          progressPercent: step.progressPercent,
          secondaryStatus: step.secondaryStatus,
        });

        // Compute deterministic win probability if cricket state is provided
        if (step.cricketState) {
          const computed = calculateCricketWinProbability(step.cricketState);
          setWinProbability(computed);
        } else if (step.winProbability) {
          setWinProbability(step.winProbability);
        }

        if (step.activePerformerId) {
          setStrikerId(step.activePerformerId);
        }

        if (step.playerStatsUpdates) {
          setPlayersList((prev) =>
            prev.map((player) => {
              if (step.playerStatsUpdates?.[player.id]) {
                return { ...player, onField: step.playerStatsUpdates[player.id] };
              }
              return player;
            })
          );
        }

        if (step.newEvent) {
          const newEvt = step.newEvent;
          setRecentEventId(newEvt.id);
          setEventsList((prev) => [newEvt, ...prev.filter((e) => e.id !== newEvt.id)]);

          if (recentEventTimeoutRef.current) {
            clearTimeout(recentEventTimeoutRef.current);
          }
          recentEventTimeoutRef.current = setTimeout(() => {
            setRecentEventId(undefined);
            recentEventTimeoutRef.current = null;
          }, 3500);
        }

        return nextIndex;
      });
    }, 6000);

    return () => {
      clearInterval(interval);
      if (recentEventTimeoutRef.current) {
        clearTimeout(recentEventTimeoutRef.current);
        recentEventTimeoutRef.current = null;
      }
    };
  }, [isSimulating, currentMatch]);

  const handleToggleSpeechDesktop = () => {
    if (isSpeakingDesktop) {
      stopSpeech();
      setIsSpeakingDesktop(false);
    } else {
      const textToRead = streamedText || sheetData?.title || "";
      if (!textToRead) return;

      speakText({
        text: textToRead,
        language,
        onStart: () => setIsSpeakingDesktop(true),
        onEnd: () => setIsSpeakingDesktop(false),
        onError: () => setIsSpeakingDesktop(false),
      });
    }
  };


  return (
    <div className="w-full flex justify-center bg-background min-h-screen text-foreground">
      {/* Container: Centered max-480px on mobile, responsive two-column grid on desktop (>=1024px) */}
      <div className="w-full max-w-6xl min-h-screen flex flex-col bg-background relative border-x border-theme/40 pb-36">
        {/* TopBar with clean branding, language pill, and settings gear popover */}
        <TopBar
          language={language}
          onLanguageChange={handleLanguageChange}
          currentSportIcon={currentMatch.sportIcon}
          persona={persona}
          onPersonaChange={handlePersonaChange}
        />

        {/* First visit tip banner (neutral prompt, dismissable and persisted) */}
        {showTipBanner && (
          <div
            role="banner"
            aria-label="First visit tip banner"
            className="mx-3 mt-2.5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3 text-xs text-foreground"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-medium text-foreground/90">
                Try it: tap any player or event for an instant explanation.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDismissBanner}
              aria-label="Dismiss tip banner"
              className="p-1 rounded-lg hover:bg-indigo-500/15 text-muted hover:text-foreground transition-colors cursor-pointer shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Multi-Sport Selector Bar across Cricket, Football, Basketball */}
        <div className="px-3 pt-2.5">
          <SportSelector
            currentMatchId={currentMatch.id}
            onSelectMatch={handleSelectMatch}
            matches={allMatches}
          />
        </div>

        {/* Main Content Layout: Single column mobile, 2-column on desktop (lg:) */}
        <div className="p-3.5 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Match & Players & Feed (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Match Card with Win Probability Meter */}
            <MatchHeader
              scoreDisplay={scoreDisplay}
              sportName={currentMatch.sportName}
              seriesOrLeague={currentMatch.seriesOrLeague}
              teams={currentMatch.teams}
              winProbability={winProbability}
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

            {/* Honest Footer: No absolute claims */}
            <footer className="pt-8 pb-3 text-center border-t border-theme space-y-1.5">
              <p className="text-xs font-bold text-foreground/80 tracking-tight">
                Match Buddy · Live Sports AI Companion
              </p>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                Player facts come from a curated dataset; AI explains them in context. AI can make mistakes. Powered by Google Gemini.
              </p>
            </footer>
          </div>

          {/* Right Column: AI Answer Panel on Desktop (lg:col-span-5) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-20">
            <div className="w-full glass-panel rounded-3xl p-5 shadow-xl space-y-4 border border-theme min-h-[460px] flex flex-col justify-between">
              {sheetData ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-raised border border-theme text-muted uppercase tracking-wider">
                        Match Intel
                      </span>
                      {reviewLabel && !isFallback && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{reviewLabel}</span>
                        </span>
                      )}
                      {isFallback && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Live AI is busy right now; showing a saved answer</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-foreground leading-snug tracking-tight">
                      {sheetData.title}
                    </h3>
                    {sheetData.subtitle && (
                      <p className="text-xs text-muted mt-0.5 font-medium">
                        {sheetData.subtitle}
                      </p>
                    )}

                    {/* AI Answer Area */}
                    <div
                      aria-live="polite"
                      lang={language === "hinglish" ? "hi-Latn" : "en"}
                      className="mt-4 text-foreground text-sm leading-relaxed"
                    >
                      {isFallback && !isLoading && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 mb-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Live AI is busy right now; showing a saved answer</span>
                        </p>
                      )}
                      {isLoading && !streamedText ? (
                        <div className="space-y-2.5 py-2">
                          <div className="h-4 w-full rounded-md animate-shimmer" />
                          <div className="h-4 w-5/6 rounded-md animate-shimmer" />
                          <div className="h-4 w-3/4 rounded-md animate-shimmer" />
                        </div>
                      ) : (
                        <p className="whitespace-pre-line font-medium selection:bg-indigo-500/30 text-foreground/95">
                          {streamedText}
                          {isLoading && (
                            <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 dark:bg-indigo-400 animate-pulse align-middle" />
                          )}
                        </p>
                      )}
                    </div>

                    {/* Tactical Context Box */}
                    {sheetData.whyItMatters && (
                      <div className="context-highlight-box p-3.5 rounded-2xl space-y-1 mt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Tactical Context</span>
                        </span>
                        <p className="text-xs text-foreground/90 font-medium leading-relaxed pl-5">
                          {sheetData.whyItMatters}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 flex items-center justify-between border-t border-theme">
                    <div className="flex items-center gap-2">
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={handleToggleSpeechDesktop}
                          aria-label={isSpeakingDesktop ? "Stop audio commentary" : "Listen to audio commentary"}
                          className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-sm ${
                            isSpeakingDesktop
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-surface-raised hover:bg-surface border border-theme text-muted hover:text-foreground"
                          }`}
                        >
                          {isSpeakingDesktop ? (
                            <>
                              <VolumeX className="w-4 h-4 text-white" />
                              <span>Stop</span>
                              <div className="flex items-center gap-0.5 ml-1">
                                <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" />
                                <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse delay-75" />
                                <span className="w-0.5 h-2 bg-white rounded-full animate-pulse delay-150" />
                              </div>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="font-semibold">Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <span className="text-xs font-bold text-muted uppercase px-2.5 py-1 rounded-lg bg-surface-raised border border-theme">
                      {language === "hinglish" ? "Hinglish" : "English"}
                    </span>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl">
                    ✨
                  </div>
                  <h4 className="text-base font-bold text-foreground">
                    Tap any player, event, or rule
                  </h4>
                  <p className="text-xs text-muted max-w-xs leading-relaxed">
                    Select any batter or bowler on the pitch, break down a match moment, or ask a question below to see instant 2-line AI explanations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Sticky AskBar at Bottom */}
        <AskBar
          onAskQuestion={handleAskQuestion}
          isLoading={isLoading}
          quickChips={currentMatch.quickQuestions}
          placeholder={`Ask about ${currentMatch.sportName}, ${currentMatch.teamFullNames[0]} vs ${currentMatch.teamFullNames[1]}...`}
        />

        {/* Mobile BottomSheet Modal for AI Answers (<1024px) */}
        <BottomSheet
          key={sheetData ? `${sheetData.title}-${sheetData.kind}-${sheetData.id || ""}` : "closed"}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          data={sheetData}
          streamedText={streamedText}
          isLoading={isLoading}
          isFallback={isFallback}
          reviewLabel={reviewLabel}
          language={language}
        />
      </div>
    </div>
  );
}
