import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@baby-tracker/shared-types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    // Bypass interceptor for Swagger docs and assets
    if (request.url.includes('/docs') || request.url.includes('/swagger-ui')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If response is already formatted as ApiResponse, return it as-is
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          ('data' in data || 'error' in data)
        ) {
          return data as ApiResponse<T>;
        }

        return {
          success: true,
          data: data ?? null,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };
      }),
    );
  }
}
