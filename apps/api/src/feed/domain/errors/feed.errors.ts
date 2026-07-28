import { NotFoundException, BadRequestException } from '@nestjs/common';

export class FeedNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      statusCode: 404,
      error: 'Not Found',
      message: `Feed event with ID "${id}" was not found`,
      code: 'FEED_NOT_FOUND',
    });
  }
}

export class InvalidFeedVolumeException extends BadRequestException {
  constructor(message = 'Consumed volume cannot exceed prepared volume') {
    super({
      statusCode: 400,
      error: 'Bad Request',
      message,
      code: 'INVALID_FEED_VOLUME',
    });
  }
}
