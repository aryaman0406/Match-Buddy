"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Volume2,
  VolumeX,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { speakText, stopSpeech } from "@/lib/speech";

export interface BottomSheetData {
  title: string;
  subtitle?: string;
  kind: "player" | "event" | "question" | "story";
  id?: string;
  queryText?: string;
  whyItMatters?: string;
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: BottomSheetData | null;
  streamedText: string;
  isLoading: boolean;
  isFallback: boolean;
  language: "en" | "hinglish";
}

export function BottomSheet({
  isOpen,
  onClose,
  data,
  streamedText,
  isLoading,
  isFallback,
  language,
}: BottomSheetProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Drag down to close state
  const touchStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const handleClose = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    onClose();
  }, [onClose]);

  // Stop speech when bottom sheet unmounts
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Focus trap & escape key handler
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }

        if (e.key === "Tab" && sheetRef.current) {
          const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        sheetRef.current?.focus();
      }, 50);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previouslyFocusedElement.current?.focus();
        stopSpeech();
      };
    }
  }, [isOpen, handleClose]);

  // Handle Speech Synthesis
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const textToRead = streamedText || data?.title || "";
      if (!textToRead) return;

      speakText({
        text: textToRead,
        language,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 90) {
      handleClose();
    }
    setDragOffset(0);
    touchStartY.current = null;
  };

  if (!isOpen || !data) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center lg:hidden"
    >
      {/* Dimmed backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Slide-up Container */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: dragOffset > 0 ? "none" : "transform 240ms ease-out",
        }}
        className="w-full max-w-[480px] bg-surface border-t border-theme rounded-t-[32px] shadow-[0_-12px_48px_rgba(0,0,0,0.6)] z-10 animate-slide-up flex flex-col max-h-[85vh] overflow-hidden focus:outline-none"
      >
        {/* Drag handle */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/30 transition-colors" />
        </div>

        {/* Header bar */}
        <div className="px-5 pb-3.5 pt-1.5 flex items-start justify-between gap-3 border-b border-theme">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-raised border border-theme text-muted uppercase tracking-wider">
                Match Intel
              </span>

              {isFallback && (
                <span
                  role="status"
                  className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Showing a saved explanation</span>
                </span>
              )}
            </div>

            <h3
              id="sheet-title"
              className="text-lg font-black text-foreground leading-snug truncate tracking-tight"
            >
              {data.title}
            </h3>

            {data.subtitle && (
              <p className="text-xs text-muted mt-0.5 truncate font-medium">
                {data.subtitle}
              </p>
            )}
          </div>

          {/* Close button with >=44px touch target */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close bottom sheet"
            className="min-w-[44px] min-h-[44px] rounded-full bg-surface-raised hover:bg-surface border border-theme flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1">
          {/* Answer Area */}
          <div
            aria-live="polite"
            lang={language === "hinglish" ? "hi-Latn" : "en"}
            className="text-foreground text-sm leading-relaxed min-h-[56px]"
          >
            {isLoading && !streamedText ? (
              <div className="space-y-2.5 py-1">
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

          {/* "Why it matters now" highlighted contextual box */}
          {data.whyItMatters && (
            <div className="context-highlight-box p-3.5 rounded-2xl space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Tactical Context</span>
              </span>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed pl-5">
                {data.whyItMatters}
              </p>
            </div>
          )}

          {/* Action Tools with >=44px touch targets */}
          <div className="pt-2 flex items-center justify-between border-t border-theme">
            <div className="flex items-center gap-2">
              {/* Speaker / Read Aloud */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                aria-label={isSpeaking ? "Stop audio commentary" : "Listen to audio commentary"}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isSpeaking
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-surface-raised hover:bg-surface border border-theme text-muted hover:text-foreground shadow-sm"
                }`}
              >
                {isSpeaking ? (
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
            </div>

            <span className="text-xs font-bold text-muted uppercase px-2.5 py-1.5 rounded-lg bg-surface-raised border border-theme">
              {language === "hinglish" ? "Hinglish" : "English"}
            </span>
          </div>


          {/* Clean footer line */}
          <div className="text-center pt-1 pb-1">
            <p className="text-xs text-muted/80 font-medium">
              Grounded in curated dataset &amp; match context.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
