export class DiaperNotFoundException extends Error {
  constructor(message = 'Diaper event not found') {
    super(message);
    this.name = 'DiaperNotFoundException';
  }
}

export class InvalidDiaperConfigurationException extends Error {
  constructor(message = 'Invalid diaper configuration') {
    super(message);
    this.name = 'InvalidDiaperConfigurationException';
  }
}
