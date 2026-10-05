type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private print(level: LogLevel, color: string, message: string, meta?: unknown) {
    const timestamp = `${colors.dim}[${this.formatTimestamp()}]${colors.reset}`;
    const tag = `${color}[${level.toUpperCase()}]${colors.reset}`;
    if (meta !== undefined) {
      console.log(`${timestamp} ${tag} ${message}`, meta);
    } else {
      console.log(`${timestamp} ${tag} ${message}`);
    }
  }

  info(message: string, meta?: unknown): void {
    this.print('info', colors.green, message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.print('warn', colors.yellow, message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.print('error', colors.red, message, meta);
  }

  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      this.print('debug', colors.cyan, message, meta);
    }
  }
}

export const logger = new Logger();
