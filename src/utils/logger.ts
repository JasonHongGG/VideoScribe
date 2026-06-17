export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.DEBUG;

  private formatMessage(levelName: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${levelName}]`;
    return [prefix, message, ...args];
  }

  debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(...this.formatMessage("DEBUG", message, ...args));
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info(...this.formatMessage("INFO", message, ...args));
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(...this.formatMessage("WARN", message, ...args));
    }
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(...this.formatMessage("ERROR", message, ...args));
    }
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }
}

export const logger = new Logger();

