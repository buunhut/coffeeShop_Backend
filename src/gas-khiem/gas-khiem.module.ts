import { ExtraService } from './../service';
import { Module } from '@nestjs/common';
import { GasKhiemService } from './gas-khiem.service';
import { GasKhiemController } from './gas-khiem.controller';

@Module({
  controllers: [GasKhiemController],
  providers: [GasKhiemService],
})
export class GasKhiemModule {}
