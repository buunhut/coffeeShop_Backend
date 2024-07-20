import { Module } from '@nestjs/common';
import { NodejsService } from './nodejs.service';
import { NodejsController } from './nodejs.controller';

@Module({
  controllers: [NodejsController],
  providers: [NodejsService],
})
export class NodejsModule {}
