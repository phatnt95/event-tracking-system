import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class AppLogger extends ConsoleLogger implements LoggerService {
  log(message: unknown, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.log(
        JSON.stringify({
          level: 'info',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: String(message) },
        }),
      );
    } else {
      super.log(message, context);
    }
  }

  error(message: unknown, stack?: string, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        JSON.stringify({
          level: 'error',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: String(message) },
          stack,
        }),
      );
    } else {
      super.error(message, stack, context);
    }
  }

  warn(message: unknown, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        JSON.stringify({
          level: 'warn',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: String(message) },
        }),
      );
    } else {
      super.warn(message, context);
    }
  }

  debug(message: unknown, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.debug(
        JSON.stringify({
          level: 'debug',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: String(message) },
        }),
      );
    } else {
      super.debug(message, context);
    }
  }
}
