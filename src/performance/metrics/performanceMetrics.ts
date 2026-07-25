type MetricName = 'FCP' | 'LCP' | 'TTI' | 'CLS' | 'FID' | 'TTFB';

type MetricHandler = (value: number) => void;

export class PerformanceMetrics {
  private observers = new Map<MetricName, PerformanceObserver>();

  constructor(private readonly handlers = new Map<MetricName, MetricHandler[]>()) {}

  register(metric: MetricName, handler: MetricHandler) {
    if (!this.handlers.has(metric)) {
      this.handlers.set(metric, []);
    }
    this.handlers.get(metric)!.push(handler);
    this.ensureObserver(metric);
  }

  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }

  private ensureObserver(metric: MetricName) {
    if (this.observers.has(metric) || typeof PerformanceObserver === 'undefined') {
      return;
    }

    const config: Record<MetricName, PerformanceObserverInit> = {
      FCP: { entryTypes: ['paint'] },
      LCP: { type: 'largest-contentful-paint', buffered: true },
      TTI: { entryTypes: ['longtask'] },
      CLS: { type: 'layout-shift', buffered: true },
      FID: { type: 'first-input', buffered: true },
      TTFB: { entryTypes: ['navigation'] }
    };

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const handlers = this.handlers.get(metric) ?? [];
        const value =
          'value' in entry ? (entry as PerformanceEntry & { value: number }).value : entry.duration;
        handlers.forEach((handler) => handler(value));
      });
    });

    observer.observe(config[metric]);
    this.observers.set(metric, observer);
  }
}

export const performanceMetrics = new PerformanceMetrics();
