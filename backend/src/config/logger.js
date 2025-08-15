import { config } from './env.js';

class Logger {
  constructor() {
    this.isDev = config.isDev;
  }

  _log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    if (this.isDev) {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message, meta) {
    this._log('info', message, meta);
  }

  warn(message, meta) {
    this._log('warn', message, meta);
  }

  error(message, meta) {
    this._log('error', message, meta);
  }

  debug(message, meta) {
    if (this.isDev) {
      this._log('debug', message, meta);
    }
  }
}

const logger = new Logger();
export { logger };
export default logger;