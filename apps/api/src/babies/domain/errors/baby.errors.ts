import { NotFoundException, ForbiddenException } from '@nestjs/common';

export class BabyNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      statusCode: 404,
      error: 'Not Found',
      message: `Baby with ID "${id}" was not found`,
      code: 'BABY_NOT_FOUND',
    });
  }
}

export class ForbiddenBabyAccessException extends ForbiddenException {
  constructor() {
    super({
      statusCode: 403,
      error: 'Forbidden',
      message: 'You do not have access permissions for this baby profile',
      code: 'FORBIDDEN_BABY_ACCESS',
    });
  }
}
