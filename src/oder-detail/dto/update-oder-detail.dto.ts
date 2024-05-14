import { PartialType } from '@nestjs/swagger';
import { CreateOderDetailDto } from './create-oder-detail.dto';

export class UpdateOderDetailDto extends PartialType(CreateOderDetailDto) {}
