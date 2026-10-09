"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  AlertCircle,
} from "lucide-react";

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
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Drag down to close state
  const touchStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Focus trap & escape key handler
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }

        // Focus trap
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

      // Focus close button initially
      setTimeout(() => {
        sheetRef.current?.focus();
      }, 50);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        // Return focus to trigger
        previouslyFocusedElement.current?.focus();
        // Stop speaking if speech synthesis is running
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [isOpen, onClose]);

  // Handle Speech Synthesis
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = streamedText || data?.title || "";
      if (!textToRead) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Copy answer to clipboard
  const handleCopy = async () => {
    if (!streamedText) return;
    try {
      await navigator.clipboard.writeText(streamedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // WhatsApp share
  const handleShare = () => {
    const textToShare = `🏆 *Match Buddy AI Insights*\n\n*${data?.title}*\n${streamedText}\n\n_Shared from Match Buddy - AI Live Sports Companion_`;
    const url = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
    window.open(url, "_blank");
  };

  // Touch handlers for swipe-down to dismiss
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
      onClose();
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
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-200"
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
          transition: dragOffset > 0 ? "none" : "transform 250ms ease-out",
        }}
        className="w-full max-w-[480px] bg-surface-raised border-t border-x border-theme rounded-t-3xl shadow-2xl z-10 animate-slide-up flex flex-col max-h-[85vh] overflow-hidden focus:outline-none"
      >
        {/* Drag handle */}
        <div className="w-full pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-border hover:bg-text-muted transition-colors" />
        </div>

        {/* Header bar: Title, AI chip, and Close button */}
        <div className="px-5 pb-3 pt-1 flex items-start justify-between gap-3 border-b border-theme/60">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent-ai/15 text-accent-ai border border-accent-ai/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-accent-ai" />
                <span>AI</span>
              </span>

              {isFallback && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span>Saved Fact</span>
                </span>
              )}
            </div>

            <h3
              id="sheet-title"
              className="text-lg font-bold text-foreground leading-snug truncate"
            >
              {data.title}
            </h3>

            {data.subtitle && (
              <p className="text-xs text-text-muted mt-0.5 truncate">
                {data.subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bottom sheet"
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-surface border border-theme flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-raised transition-colors active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with custom scroll */}
        <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1">
          {/* Fallback Notice Banner */}
          {isFallback && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>Showing a saved explanation (AI unavailable right now).</span>
            </div>
          )}

          {/* Answer Area */}
          <div
            aria-live="polite"
            lang={language === "hinglish" ? "hi-Latn" : "en"}
            className="text-foreground text-sm leading-relaxed min-h-[56px]"
          >
            {isLoading && !streamedText ? (
              /* Shimmer skeleton lines */
              <div className="space-y-2.5 py-1">
                <div className="h-4 w-full rounded-md animate-shimmer" />
                <div className="h-4 w-5/6 rounded-md animate-shimmer" />
                <div className="h-4 w-3/4 rounded-md animate-shimmer" />
              </div>
            ) : (
              <p className="whitespace-pre-line font-medium selection:bg-accent-ai/30">
                {streamedText}
                {isLoading && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-accent-ai animate-pulse align-middle" />
                )}
              </p>
            )}
          </div>

          {/* "Why it matters now" highlighted box with purple left border */}
          {data.whyItMatters && (
            <div className="ai-generated-box p-3 rounded-r-xl space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-ai block">
                Why it matters right now
              </span>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                {data.whyItMatters}
              </p>
            </div>
          )}

          {/* Action Tools: Voice, Copy, WhatsApp Share */}
          <div className="pt-2 flex items-center justify-between border-t border-theme/60">
            <div className="flex items-center gap-2">
              {/* Speaker / Read Aloud */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                aria-label={isSpeaking ? "Stop reading" : "Read explanation aloud"}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                  isSpeaking
                    ? "bg-accent-ai text-white border-accent-ai shadow-sm"
                    : "bg-surface border-theme text-text-muted hover:text-foreground"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 animate-pulse" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy explanation"
                className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-surface border border-theme text-text-muted hover:text-foreground text-xs font-semibold transition-all cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share on WhatsApp"
                className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-surface border border-theme text-text-muted hover:text-foreground text-xs font-semibold transition-all cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
                <span>Share</span>
              </button>
            </div>

            {/* Language indicator pill */}
            <span className="text-[10px] font-semibold text-text-muted uppercase px-2 py-1 rounded bg-surface border border-theme">
              {language === "hinglish" ? "Hinglish" : "English"}
            </span>
          </div>

          {/* AI Disclaimer Note */}
          <div className="text-center pt-1 pb-1">
            <p className="text-[10px] text-text-muted/80">
              ⚡ AI-generated, may contain errors. Grounded in verified match facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
