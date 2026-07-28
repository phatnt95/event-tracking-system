import { ConflictException, UnauthorizedException } from '@nestjs/common';

export class EmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      statusCode: 409,
      error: 'Conflict',
      message: `Email "${email}" is already registered`,
      code: 'EMAIL_ALREADY_EXISTS',
    });
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    });
  }
}

export class InvalidTokenException extends UnauthorizedException {
  constructor(message = 'Invalid authentication token') {
    super({
      statusCode: 401,
      error: 'Unauthorized',
      message,
      code: 'INVALID_TOKEN',
    });
  }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token has expired',
      code: 'TOKEN_EXPIRED',
    });
  }
}
