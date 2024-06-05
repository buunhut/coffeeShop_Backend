import { PartialType } from '@nestjs/swagger';
import { CreateGasKhiemDto } from './create-gas-khiem.dto';

export class UpdateGasKhiemDto extends PartialType(CreateGasKhiemDto) {}
