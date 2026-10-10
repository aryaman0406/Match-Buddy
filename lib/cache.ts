export interface CacheKeyParams {
  kind: string;
  idOrText: string;
  language: string;
  persona?: string;
  sport?: string;
}

export function generateCacheKey(params: CacheKeyParams): string {
  const kind = (params.kind || "").trim().toLowerCase();
  const idOrText = (params.idOrText || "").trim().toLowerCase().replace(/\s+/g, " ");
  const language = (params.language || "en").trim().toLowerCase();
  const persona = (params.persona || "casual").trim().toLowerCase();
  const sport = (params.sport || "cricket").trim().toLowerCase();

  return `${kind}:${idOrText}:${language}:${persona}:${sport}`;
}

export interface CacheEntry {
  response: string;
  expiresAt: number;
}

export class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private ttlMs: number;

  constructor(ttlMs: number = 30 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  set(key: string, response: string): void {
    this.cache.set(key, {
      response,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global in-memory singleton for the server runtime
export const globalResponseCache = new ResponseCache(30 * 60 * 1000);
