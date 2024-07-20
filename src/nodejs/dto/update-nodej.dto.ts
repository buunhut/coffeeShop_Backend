import { PartialType } from '@nestjs/swagger';
import { CreateNodejDto } from './create-nodej.dto';

export class UpdateNodejDto extends PartialType(CreateNodejDto) {}
