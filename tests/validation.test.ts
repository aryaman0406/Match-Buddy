import { describe, it, expect } from "vitest";
import { validateExplainInput } from "../lib/validation";

describe("Input Validation for /api/explain", () => {
  it("validates valid player explanation request", () => {
    const result = validateExplainInput({
      kind: "player",
      id: "hardik-pandya",
      language: "en",
      persona: "casual",
      sport: "Cricket",
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.data.kind).toBe("player");
      expect(result.data.language).toBe("en");
      expect(result.data.persona).toBe("casual");
    }
  });

  it("validates valid free-text question under 200 characters", () => {
    const result = validateExplainInput({
      kind: "question",
      text: "What is the DLS method in cricket?",
      language: "hinglish",
      persona: "desi",
      sport: "Cricket",
    });
    expect(result.isValid).toBe(true);
  });

  it("rejects free-text question exceeding 200 characters", () => {
    const longText = "a".repeat(201);
    const result = validateExplainInput({
      kind: "question",
      text: longText,
      language: "en",
      persona: "analyst",
      sport: "Cricket",
    });
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toContain("200 characters");
    }
  });

  it("rejects invalid kind", () => {
    const result = validateExplainInput({
      kind: "invalid-kind" as unknown as "player",
      language: "en",
      persona: "casual",
      sport: "Cricket",
    });
    expect(result.isValid).toBe(false);
  });

  it("rejects invalid language", () => {
    const result = validateExplainInput({
      kind: "player",
      language: "french" as unknown as "en",
      persona: "casual",
      sport: "Cricket",
    });
    expect(result.isValid).toBe(false);
  });

  it("rejects invalid persona", () => {
    const result = validateExplainInput({
      kind: "player",
      language: "en",
      persona: "robot" as unknown as "casual",
      sport: "Cricket",
    });
    expect(result.isValid).toBe(false);
  });
});
