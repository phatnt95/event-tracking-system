import { NotFoundException, ForbiddenException } from '@nestjs/common';

export class EventNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      statusCode: 404,
      error: 'Not Found',
      message: `Event with ID "${id}" was not found`,
      code: 'EVENT_NOT_FOUND',
    });
  }
}

export class ForbiddenEventAccessException extends ForbiddenException {
  constructor() {
    super({
      statusCode: 403,
      error: 'Forbidden',
      message: 'You do not have access permissions for this event',
      code: 'FORBIDDEN_EVENT_ACCESS',
    });
  }
}
