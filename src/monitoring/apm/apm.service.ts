import { logger } from '../logging/logger';

export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface ApmMetric {
  name: string;
  unit: string;
  points: MetricPoint[];
}

export class ApmService {
  private metrics = new Map<string, ApmMetric>();

  record(name: string, value: number, unit: string) {
    const metric = this.metrics.get(name) ?? { name, unit, points: [] };
    metric.points.push({ timestamp: Date.now(), value });
    this.metrics.set(name, metric);
  }

  getMetric(name: string): ApmMetric | undefined {
    return this.metrics.get(name);
  }

  report() {
    logger.info('APM metrics snapshot', Object.fromEntries(this.metrics.entries()));
  }
}

export const apmService = new ApmService();
