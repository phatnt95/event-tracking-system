import { PartialType } from '@nestjs/swagger';
import { CreateDiaperDto } from './create-diaper.dto';

export class UpdateDiaperDto extends PartialType(CreateDiaperDto) {}
