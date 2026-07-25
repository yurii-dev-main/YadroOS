import { logger } from '../logging/logger';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down';
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  version: string;
  uptime: number;
}

export type HealthCheckHandler = () => Promise<Partial<HealthCheckResult>>;

export class UptimeMonitor {
  private handlers: HealthCheckHandler[] = [];

  register(handler: HealthCheckHandler) {
    this.handlers.push(handler);
  }

  async check(): Promise<HealthCheckResult> {
    const base: HealthCheckResult = {
      status: 'ok',
      database: 'connected',
      redis: 'connected',
      version: '1.0.0',
      uptime: Math.floor(typeof performance !== 'undefined' ? performance.now() : Date.now())
    };

    for (const handler of this.handlers) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await handler();
        Object.assign(base, result);
      } catch (error) {
        logger.error('Health check handler failed', { error });
        base.status = 'degraded';
      }
    }

    return base;
  }
}

export const uptimeMonitor = new UptimeMonitor();
