import { BadRequestException, NotFoundException } from '@nestjs/common';

export class DiaperNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      statusCode: 404,
      error: 'Not Found',
      message: `Diaper event with ID "${id}" was not found`,
      code: 'DIAPER_NOT_FOUND',
    });
  }
}

export class InvalidDiaperConfigurationException extends BadRequestException {
  constructor(message: string) {
    super({
      statusCode: 400,
      error: 'Bad Request',
      message,
      code: 'INVALID_DIAPER_CONFIGURATION',
    });
  }
}
