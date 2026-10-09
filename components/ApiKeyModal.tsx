"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Sparkles, Check, ExternalLink, ShieldCheck, Trash2, Eye, EyeOff, Activity, AlertCircle } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  geminiModel: string;
  onSaveKey: (key: string, model: string) => void;
  onClearKey: () => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  geminiKey,
  geminiModel,
  onSaveKey,
  onClearKey,
}: ApiKeyModalProps) {
  const [inputKey, setInputKey] = useState(geminiKey);
  const [selectedModel, setSelectedModel] = useState(geminiModel || "gemini-2.0-flash");
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setInputKey(geminiKey);
    setSelectedModel(geminiModel || "gemini-2.0-flash");
    setTestResult(null);
  }, [geminiKey, geminiModel, isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setTestResult({ ok: false, message: "Please enter a key to test." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "question",
          text: "What is cricket?",
          language: "en",
          geminiApiKey: inputKey.trim(),
          geminiModel: selectedModel,
        }),
      });

      const elapsed = Math.round(performance.now() - start);

      if (res.ok) {
        setTestResult({
          ok: true,
          message: `Connection successful! ${selectedModel} responded in ${elapsed}ms`,
        });
      } else {
        const errorJson = await res.json().catch(() => null);
        setTestResult({
          ok: false,
          message: errorJson?.error || `Server responded with code ${res.status}`,
        });
      }
    } catch (err: unknown) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : "Network error testing API key",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputKey.trim(), selectedModel);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setInputKey("");
    setTestResult(null);
    onClearKey();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-theme rounded-2xl p-5 sm:p-6 shadow-2xl relative space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-ai/15 border border-accent-ai/30 flex items-center justify-center text-accent-ai">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 id="api-key-modal-title" className="text-base font-bold text-foreground">
                Google Gemini AI Setup
              </h2>
              <p className="text-xs text-text-muted">
                Power Match Buddy across all sports &amp; teams
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            geminiKey
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-surface-raised border-theme text-text-muted"
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              geminiKey ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <div className="flex-1">
            {geminiKey ? (
              <span className="font-semibold text-emerald-300">
                Gemini AI Connected (Live Streaming Active)
              </span>
            ) : (
              <span>
                No custom key entered — using grounded sports database &amp; verified fallbacks.
              </span>
            )}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <label htmlFor="gemini-key-input">Gemini API Key</label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-accent-ai hover:underline flex items-center gap-1 font-normal"
              >
                <span>Get free key from Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                id="gemini-key-input"
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-surface-raised border border-theme text-foreground placeholder:text-text-muted text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent-ai"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-text-muted">
              Key is stored locally in your browser and used securely for live sports answers.
            </p>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label htmlFor="gemini-model-select" className="text-xs font-semibold text-foreground block">
              Gemini Model
            </label>
            <select
              id="gemini-model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-theme text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-ai cursor-pointer"
            >
              <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended: Instant Streaming)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Fast &amp; Efficient)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning Depth)</option>
            </select>
          </div>

          {/* Test Connection Button & Result Feedback */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !inputKey.trim()}
              className="w-full h-9 rounded-xl bg-surface-raised border border-theme hover:border-accent-ai/50 text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Activity className={`w-3.5 h-3.5 text-accent-ai ${isTesting ? "animate-spin" : ""}`} />
              <span>{isTesting ? "Testing Connection..." : "Test Key Connection"}</span>
            </button>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 animate-fade-in ${
                  testResult.ok
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {testResult.ok ? (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saveSuccess}
              className="flex-1 h-11 rounded-xl bg-accent-ai hover:bg-accent-ai/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save &amp; Connect Gemini</span>
                </>
              )}
            </button>

            {geminiKey && (
              <button
                type="button"
                onClick={handleClear}
                title="Remove saved key"
                className="h-11 px-3 rounded-xl bg-surface-raised border border-theme hover:border-rose-500/40 text-text-muted hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Security badge note */}
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted justify-center border-t border-theme/40 pt-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-ai" />
          <span>Works for any sport, any team, and casual fan explanations.</span>
        </div>
      </div>
    </div>
  );
}
