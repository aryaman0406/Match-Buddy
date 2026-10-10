export interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class InMemoryRateLimiter {
  private ipMap = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 10 * 60 * 1000, maxRequests: number = 20) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.ipMap.get(ip);

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.ipMap.set(ip, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (record.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count += 1;
    return { allowed: true, remaining: this.maxRequests - record.count, resetTime: record.resetTime };
  }

  reset(): void {
    this.ipMap.clear();
  }
}

export const globalRateLimiter = new InMemoryRateLimiter(10 * 60 * 1000, 20);
