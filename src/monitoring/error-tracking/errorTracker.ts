import { logger } from '../logging/logger';

export interface ErrorTrackerConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  enabled?: boolean;
}

export interface ErrorMetadata {
  userId?: string;
  role?: string;
  action?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

type CaptureFunction = (error: Error, metadata?: ErrorMetadata) => void;

declare global {
  interface Window {
    Sentry?: {
      init: (config: Record<string, unknown>) => void;
      captureException: CaptureFunction;
      captureMessage: (message: string, level?: string) => void;
      setUser: (user: Record<string, unknown> | null) => void;
      configureScope: (
        callback: (scope: { setTag: (key: string, value: string) => void }) => void
      ) => void;
    };
  }
}

export class ErrorTracker {
  private initialized = false;

  constructor(private readonly config: ErrorTrackerConfig) {}

  async init() {
    if (this.initialized || this.config.enabled === false) {
      return;
    }

    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release
      });
      this.initialized = true;
      logger.info('Sentry initialized');
    } else {
      logger.warn('Sentry not available, falling back to console error tracking');
      this.initialized = true;
    }
  }

  captureException(error: Error, metadata?: ErrorMetadata) {
    if (!this.initialized) {
      void this.init();
    }

    if (typeof window !== 'undefined' && window.Sentry) {
      if (metadata?.userId || metadata?.role) {
        window.Sentry.setUser({ id: metadata?.userId, role: metadata?.role });
      }
      if (metadata?.tags) {
        window.Sentry.configureScope((scope) => {
          Object.entries(metadata.tags ?? {}).forEach(([key, value]) => scope.setTag(key, value));
        });
      }
      window.Sentry.captureException(error, metadata);
      return;
    }

    logger.error('Captured error', { error: error.message, stack: error.stack, metadata });
  }

  captureMessage(message: string, metadata?: ErrorMetadata) {
    if (!this.initialized) {
      void this.init();
    }

    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureMessage(message, metadata?.tags?.level ?? 'info');
    } else {
      logger.warn(message, metadata?.extra);
    }
  }
}

export const errorTracker = new ErrorTracker({ enabled: true });
