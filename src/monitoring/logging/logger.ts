export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export type LogTransport = (entry: LogEntry) => void;

const defaultTransport: LogTransport = (entry) => {
  const { level, message, context, timestamp } = entry;
  const data = context ? context : '';
  switch (level) {
    case 'debug':
      console.debug(`[${timestamp}] ${message}`, data);
      break;
    case 'info':
      console.info(`[${timestamp}] ${message}`, data);
      break;
    case 'warn':
      console.warn(`[${timestamp}] ${message}`, data);
      break;
    case 'error':
    case 'fatal':
      console.error(`[${timestamp}] ${message}`, data);
      break;
    default:
      console.log(`[${timestamp}] ${message}`, data);
  }
};

export class Logger {
  private transports: LogTransport[] = [defaultTransport];

  constructor(private readonly minLevel: LogLevel = 'info') {}

  addTransport(transport: LogTransport) {
    this.transports.push(transport);
  }

  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog(level)) {
      return;
    }
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    };
    this.transports.forEach((transport) => transport(entry));
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  fatal(message: string, context?: Record<string, unknown>) {
    this.log('fatal', message, context);
  }

  private shouldLog(level: LogLevel) {
    const order: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    return order.indexOf(level) >= order.indexOf(this.minLevel);
  }
}

export const logger = new Logger('info');
