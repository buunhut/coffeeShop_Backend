import { Module } from '@nestjs/common';
import { OderDetailService } from './oder-detail.service';
import { OderDetailController } from './oder-detail.controller';

@Module({
  controllers: [OderDetailController],
  providers: [OderDetailService],
})
export class OderDetailModule {}
