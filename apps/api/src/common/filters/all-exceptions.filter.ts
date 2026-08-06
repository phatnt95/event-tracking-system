import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@baby-tracker/shared-types';
import { AppLogger } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let details: string[] | Record<string, unknown> | null = null;
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      const responseContent = exception.getResponse();
      if (typeof responseContent === 'object' && responseContent !== null) {
        const resObj = responseContent as Record<string, unknown>;
        const resMessage = resObj.message;
        message = Array.isArray(resMessage)
          ? resMessage.join(', ')
          : typeof resMessage === 'string'
            ? resMessage
            : exception.message;
        code =
          typeof resObj.error === 'string' ? resObj.error : HttpStatus[status] || 'HTTP_EXCEPTION';
        details = Array.isArray(resMessage) ? (resMessage as string[]) : null;
      } else {
        message = exception.message;
        code = HttpStatus[status] || 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'ERROR';
    }

    const logContext = `[${request.method}] ${request.url} - Status: ${status} - Error: ${message}`;

    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(logContext, stack);
    } else {
      const detailStr = details ? ` - Details: ${JSON.stringify(details)}` : '';
      this.logger.warn(`${logContext}${detailStr}`);
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: {
        statusCode: status,
        message,
        code,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }
}
