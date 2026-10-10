import { describe, it, expect, beforeEach } from "vitest";
import { generateCacheKey, ResponseCache } from "../lib/cache";

describe("Cache Key Generator", () => {
  it("generates deterministic cache keys for identical inputs", () => {
    const key1 = generateCacheKey({
      kind: "player",
      idOrText: "hardik-pandya",
      language: "en",
      persona: "casual",
      sport: "Cricket",
    });

    const key2 = generateCacheKey({
      kind: "player",
      idOrText: "hardik-pandya",
      language: "en",
      persona: "casual",
      sport: "Cricket",
    });

    expect(key1).toBe(key2);
  });

  it("normalizes text case and whitespace", () => {
    const key1 = generateCacheKey({
      kind: "question",
      idOrText: "what is dls?",
      language: "en",
      persona: "casual",
      sport: "Cricket",
    });

    const key2 = generateCacheKey({
      kind: "question",
      idOrText: "  WHAT IS DLS?  ",
      language: "en",
      persona: "casual",
      sport: "Cricket",
    });

    expect(key1).toBe(key2);
  });

  it("produces distinct keys when language or persona differs", () => {
    const keyEn = generateCacheKey({
      kind: "player",
      idOrText: "hardik-pandya",
      language: "en",
      persona: "casual",
      sport: "Cricket",
    });

    const keyHinglish = generateCacheKey({
      kind: "player",
      idOrText: "hardik-pandya",
      language: "hinglish",
      persona: "casual",
      sport: "Cricket",
    });

    expect(keyEn).not.toBe(keyHinglish);
  });
});

describe("In-Memory ResponseCache", () => {
  let testCache: ResponseCache;

  beforeEach(() => {
    testCache = new ResponseCache(1000); // 1-second TTL for testing
  });

  it("stores and retrieves cached values", () => {
    testCache.set("key-1", "Sample AI explanation text");
    expect(testCache.get("key-1")).toBe("Sample AI explanation text");
  });

  it("returns null for non-existent keys", () => {
    expect(testCache.get("key-nonexistent")).toBeNull();
  });

  it("expires cached entries after TTL expires", async () => {
    const shortCache = new ResponseCache(20); // 20ms TTL
    shortCache.set("temp-key", "temporary");
    expect(shortCache.get("temp-key")).toBe("temporary");

    await new Promise((resolve) => setTimeout(resolve, 35));
    expect(shortCache.get("temp-key")).toBeNull();
  });
});
