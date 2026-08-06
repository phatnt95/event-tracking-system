import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ITokenService } from '../../application/interfaces/token-service.interface';
import { InvalidTokenException } from '../../domain/errors/auth.errors';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(ITokenService)
    private readonly tokenService: ITokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new InvalidTokenException('Missing authentication token');
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      // Inject user payload into request context
      (request as Request & { user?: unknown }).user = payload;
    } catch {
      throw new InvalidTokenException('Session has expired or token is invalid');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
