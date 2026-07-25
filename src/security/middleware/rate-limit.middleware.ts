export interface RateLimitConfig {
  user?: number;
  ip?: number;
  endpoint?: Record<string, number>;
  intervalMs?: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const DEFAULT_INTERVAL = 60 * 1000;

const createKey = (parts: (string | undefined)[]) => parts.filter(Boolean).join('::');

export class RateLimiter {
  private store = new Map<string, RateLimitState>();

  constructor(private readonly config: RateLimitConfig) {}

  private resolveLimit(endpoint?: string): number | undefined {
    if (endpoint && this.config.endpoint?.[endpoint] != null) {
      return this.config.endpoint[endpoint];
    }
    return undefined;
  }

  private nextState(key: string, limit: number, interval: number): RateLimitResult {
    const now = Date.now();
    const state = this.store.get(key) ?? { count: 0, resetAt: now + interval };
    if (state.resetAt < now) {
      state.count = 0;
      state.resetAt = now + interval;
    }
    state.count += 1;
    this.store.set(key, state);
    if (state.count > limit) {
      return { allowed: false, remaining: 0, resetAt: state.resetAt };
    }
    return { allowed: true, remaining: Math.max(limit - state.count, 0), resetAt: state.resetAt };
  }

  check(params: { userId?: string; ip?: string; endpoint?: string }): RateLimitResult {
    const interval = this.config.intervalMs ?? DEFAULT_INTERVAL;
    const scopes: Array<{ key: string; limit?: number }> = [];

    if (this.config.user && params.userId) {
      scopes.push({ key: createKey(['user', params.userId]), limit: this.config.user });
    }
    if (this.config.ip && params.ip) {
      scopes.push({ key: createKey(['ip', params.ip]), limit: this.config.ip });
    }
    const endpointLimit = this.resolveLimit(params.endpoint);
    if (endpointLimit) {
      scopes.push({ key: createKey(['endpoint', params.endpoint]), limit: endpointLimit });
    }

    let result: RateLimitResult = {
      allowed: true,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: Date.now() + interval
    };
    for (const scope of scopes) {
      if (!scope.limit) {
        continue;
      }
      const evaluation = this.nextState(scope.key, scope.limit, interval);
      if (!evaluation.allowed) {
        return evaluation;
      }
      result = {
        allowed: result.allowed && evaluation.allowed,
        remaining: Math.min(result.remaining, evaluation.remaining),
        resetAt: Math.max(result.resetAt, evaluation.resetAt)
      };
    }

    return result;
  }

  reset(keyFragment: string) {
    for (const key of this.store.keys()) {
      if (key.includes(keyFragment)) {
        this.store.delete(key);
      }
    }
  }
}

export const defaultRateLimiter = new RateLimiter({
  user: 100,
  ip: 500,
  endpoint: {},
  intervalMs: DEFAULT_INTERVAL
});
