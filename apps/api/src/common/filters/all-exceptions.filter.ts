/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@baby-tracker/shared-types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let details: any = null;
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      const responseContent = exception.getResponse();
      if (typeof responseContent === 'object' && responseContent !== null) {
        const resObj = responseContent as any;
        message = Array.isArray(resObj.message)
          ? resObj.message.join(', ')
          : resObj.message || exception.message;
        code = resObj.error || HttpStatus[status] || 'HTTP_EXCEPTION';
        details = Array.isArray(resObj.message) ? resObj.message : null;
      } else {
        message = exception.message;
        code = HttpStatus[status] || 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'ERROR';
    }

    this.logger.error(
      `[${request.method}] ${request.url} - Error: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

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
