interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheStrategyOptions {
  ttlMs: number;
  maxEntries?: number;
  namespace?: string;
}

export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private readonly options: CacheStrategyOptions) {}

  set(key: string, value: T) {
    const expiresAt = Date.now() + this.options.ttlMs;
    const namespacedKey = this.namespacedKey(key);
    this.cache.set(namespacedKey, { value, expiresAt });
    this.evictIfNeeded();
  }

  get(key: string): T | undefined {
    const namespacedKey = this.namespacedKey(key);
    const entry = this.cache.get(namespacedKey);
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(namespacedKey);
      return undefined;
    }
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear() {
    this.cache.clear();
  }

  private evictIfNeeded() {
    const { maxEntries } = this.options;
    if (!maxEntries || this.cache.size <= maxEntries) {
      return;
    }
    const entries = [...this.cache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    while (entries.length > maxEntries) {
      const entry = entries.shift();
      if (entry) {
        this.cache.delete(entry[0]);
      }
    }
  }

  private namespacedKey(key: string) {
    return this.options.namespace ? `${this.options.namespace}:${key}` : key;
  }
}

export const createCacheManager = <T>(options: CacheStrategyOptions) => new CacheManager<T>(options);
