export interface RateLimitConfig {
  requestsPerMinute: number;
  burstCapacity?: number;
}

export interface RateLimitState {
  remaining: number;
  resetAt: string;
  limited: boolean;
}

export class RateLimiter {
  private readonly config: RateLimitConfig;
  private state: RateLimitState;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.state = {
      remaining: config.requestsPerMinute,
      resetAt: new Date(Date.now() + 60_000).toISOString(),
      limited: false
    };
  }

  consume(): RateLimitState {
    const now = Date.now();
    const resetAtMs = Date.parse(this.state.resetAt);
    if (now >= resetAtMs) {
      this.state = {
        remaining: this.config.requestsPerMinute,
        resetAt: new Date(now + 60_000).toISOString(),
        limited: false
      };
    }

    if (this.state.remaining > 0) {
      this.state.remaining -= 1;
      this.state.limited = false;
    } else {
      this.state.limited = true;
    }

    return this.state;
  }

  getState(): RateLimitState {
    return this.state;
  }
}

export function getRateLimitHeaders(state: RateLimitState): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(Math.max(state.remaining, 0)),
    'X-RateLimit-Reset': state.resetAt,
    'X-RateLimit-Limited': state.limited ? '1' : '0'
  };
}
