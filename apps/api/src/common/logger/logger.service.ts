/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class AppLogger extends ConsoleLogger implements LoggerService {
  log(message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.log(
        JSON.stringify({
          level: 'info',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: message },
        }),
      );
    } else {
      super.log(message, context);
    }
  }

  error(message: any, stack?: string, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        JSON.stringify({
          level: 'error',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: message },
          stack,
        }),
      );
    } else {
      super.error(message, stack, context);
    }
  }

  warn(message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        JSON.stringify({
          level: 'warn',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: message },
        }),
      );
    } else {
      super.warn(message, context);
    }
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'production') {
      console.debug(
        JSON.stringify({
          level: 'debug',
          timestamp: new Date().toISOString(),
          context: context || this.context,
          message: typeof message === 'object' ? message : { text: message },
        }),
      );
    } else {
      super.debug(message, context);
    }
  }
}
