import { CacheManager, createCacheManager } from '../cache/cacheManager';
import { performanceMetrics } from '../metrics/performanceMetrics';

export interface PerformanceBudget {
  initialJsKb: number;
  totalJsKb: number;
  lcpMs: number;
  fcpMs: number;
}

export class PerformanceManager {
  private cache: CacheManager<unknown>;

  constructor(private readonly budget: PerformanceBudget) {
    this.cache = createCacheManager({ ttlMs: 60 * 1000, maxEntries: 100, namespace: 'performance' });
  }

  trackMetric(name: Parameters<typeof performanceMetrics.register>[0], handler: Parameters<typeof performanceMetrics.register>[1]) {
    performanceMetrics.register(name, handler);
  }

  cacheResponse<T>(key: string, value: T) {
    this.cache.set(key, value);
    return value;
  }

  getCachedResponse<T>(key: string) {
    return this.cache.get(key) as T | undefined;
  }

  meetsBudget(stats: { initialJsKb: number; totalJsKb: number; lcpMs: number; fcpMs: number }) {
    return (
      stats.initialJsKb <= this.budget.initialJsKb &&
      stats.totalJsKb <= this.budget.totalJsKb &&
      stats.lcpMs <= this.budget.lcpMs &&
      stats.fcpMs <= this.budget.fcpMs
    );
  }
}

export const performanceManager = new PerformanceManager({
  initialJsKb: 250,
  totalJsKb: 600,
  lcpMs: 2500,
  fcpMs: 1500
});
