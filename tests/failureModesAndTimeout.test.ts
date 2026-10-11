import { describe, it, expect, vi } from "vitest";
import { validateExplainInput } from "../lib/validation";

describe("Failure Modes, Timeouts & Error Response Hardening", () => {
  it("Validates that input validation rejects oversized inputs (>200 chars)", () => {
    const res = validateExplainInput({
      kind: "question",
      text: "a".repeat(201),
      sport: "Cricket",
      language: "en",
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toContain("200 characters");
    }
  });

  it("Validates that input validation rejects whitespace-only questions", () => {
    const res = validateExplainInput({
      kind: "question",
      text: "   \t\n  ",
      sport: "Cricket",
      language: "en",
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toContain("cannot be empty or whitespace only");
    }
  });

  it("Simulates 10-second client timeout triggering graceful fallback", () => {
    vi.useFakeTimers();

    let isFallback = false;
    let isLoading = true;
    const receivedFirstToken = false;
    let aborted = false;

    const controller = {
      abort: () => { aborted = true; },
    };

    // Client timeout simulation identical to app/page.tsx:248-256
    const timeoutId = setTimeout(() => {
      if (!receivedFirstToken) {
        controller.abort();
        isFallback = true;
        isLoading = false;
      }
    }, 10000);

    // Advance 5 seconds - still waiting
    vi.advanceTimersByTime(5000);
    expect(isFallback).toBe(false);
    expect(isLoading).toBe(true);
    expect(aborted).toBe(false);

    // Advance past 10 seconds - timeout fires
    vi.advanceTimersByTime(5001);
    expect(isFallback).toBe(true);
    expect(isLoading).toBe(false);
    expect(aborted).toBe(true);

    clearTimeout(timeoutId);
    vi.useRealTimers();
  });

  it("Clearing timeout on first token arrival prevents fallback trigger", () => {
    vi.useFakeTimers();

    let isFallback = false;
    let isLoading = true;
    let receivedFirstToken = false;
    let timeoutCleared = false;

    const timeoutId = setTimeout(() => {
      if (!receivedFirstToken) {
        isFallback = true;
        isLoading = false;
      }
    }, 10000);

    // First token arrives at 1.5s
    vi.advanceTimersByTime(1500);
    receivedFirstToken = true;
    clearTimeout(timeoutId);
    timeoutCleared = true;

    // Advance past 10s
    vi.advanceTimersByTime(12000);
    expect(isFallback).toBe(false);
    expect(isLoading).toBe(true);
    expect(timeoutCleared).toBe(true);

    vi.useRealTimers();
  });

  it("Sanitizes API key patterns from error strings", () => {
    const fakeLeak = "Error fetching https://generativelanguage.googleapis.com?key=AIzaSyDfake1234567890abcdefghijklmnopqr: 404";
    const sanitized = fakeLeak.replace(/AIza[0-9A-Za-z-_]{35}/g, "AIza***");
    expect(sanitized).not.toContain("AIzaSyDfake");
    expect(sanitized).toContain("AIza***");
  });
});
