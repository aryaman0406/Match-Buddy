/**
 * Robust Cross-Browser Speech Synthesis Utility
 *
 * Fixes common Chromium/Safari issues:
 * 1. Garbage collection bug: V8 prematurely GCs SpeechSynthesisUtterance mid-speech unless held in module scope.
 * 2. Stuck audio queue: SpeechSynthesis hangs if queued while in a paused or blocked internal state.
 * 3. Text cleaning: Strips emojis and markdown symbols to prevent speech synthesis glitches.
 * 4. Language/voice selection: Intelligently falls back between regional voices.
 * 5. Long utterance freeze: Chromium heartbeat interval prevents speech cutoff after 15 seconds.
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechHeartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function isCurrentlySpeaking(): boolean {
  return (
    activeUtterance !== null &&
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    window.speechSynthesis.speaking
  );
}

export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    // Remove emojis
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    // Remove markdown formatting like bold, italics, headers, links
    .replace(/[*_#`~[\]()]/g, " ")
    // Collapse multiple whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export function stopSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  if (speechHeartbeatInterval) {
    clearInterval(speechHeartbeatInterval);
    speechHeartbeatInterval = null;
  }

  if (activeUtterance) {
    activeUtterance.onstart = null;
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
    activeUtterance = null;
  }

  try {
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn("SpeechSynthesis cancel error:", err);
  }
}


export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speakText({
  text,
  language = "en",
  onStart,
  onEnd,
  onError,
}: {
  text: string;
  language?: "en" | "hinglish";
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}): void {
  if (!isSpeechSupported()) {
    onError?.(new Error("Speech synthesis is not supported on this browser."));
    onEnd?.();
    return;
  }

  // Cancel any ongoing audio
  stopSpeech();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    onEnd?.();
    return;
  }

  // Resume if paused
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {
    // Ignore
  }

  // Create utterance and hold reference in module scope to prevent GC
  const utterance = new SpeechSynthesisUtterance(cleaned);
  activeUtterance = utterance;

  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Resolve voice
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (language === "hinglish") {
        const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
        const enInVoice = voices.find(
          (v) => v.lang.toLowerCase().includes("in") || v.lang.toLowerCase().includes("india")
        );
        if (hiVoice) {
          utterance.voice = hiVoice;
          utterance.lang = hiVoice.lang;
        } else if (enInVoice) {
          utterance.voice = enInVoice;
          utterance.lang = enInVoice.lang;
        } else {
          utterance.lang = "en-US";
        }
      } else {
        const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        if (enVoice) {
          utterance.voice = enVoice;
          utterance.lang = enVoice.lang;
        } else {
          utterance.lang = "en-US";
        }
      }
    } else {
      utterance.lang = language === "hinglish" ? "hi-IN" : "en-US";
    }
  } catch {
    utterance.lang = language === "hinglish" ? "hi-IN" : "en-US";
  }

  utterance.onstart = () => {
    onStart?.();

    // Heartbeat for Chromium on Windows to prevent freeze on long sentences
    if (speechHeartbeatInterval) clearInterval(speechHeartbeatInterval);
    speechHeartbeatInterval = setInterval(() => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (!window.speechSynthesis.speaking) {
          if (speechHeartbeatInterval) {
            clearInterval(speechHeartbeatInterval);
            speechHeartbeatInterval = null;
          }
        } else if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 4000);
  };

  utterance.onend = () => {
    if (speechHeartbeatInterval) {
      clearInterval(speechHeartbeatInterval);
      speechHeartbeatInterval = null;
    }
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    if (speechHeartbeatInterval) {
      clearInterval(speechHeartbeatInterval);
      speechHeartbeatInterval = null;
    }
    activeUtterance = null;
    // Canceled/interrupted by user action should not trigger an error state
    if (e.error === "canceled" || e.error === "interrupted") {
      onEnd?.();
      return;
    }
    onError?.(e);
    onEnd?.();
  };

  // Small delay so cancel() completes cleanly before speaking
  setTimeout(() => {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      onError?.(err);
      onEnd?.();
    }
  }, 15);
}
