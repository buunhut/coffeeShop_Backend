import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OderDetailService } from './oder-detail.service';
import { CreateOderDetailDto } from './dto/create-oder-detail.dto';
import { UpdateOderDetailDto } from './dto/update-oder-detail.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('oder-detail')
@Controller('oder-detail')
export class OderDetailController {
  constructor(private readonly oderDetailService: OderDetailService) {}

  // @Post()
  // create(@Body() createOderDetailDto: CreateOderDetailDto) {
  //   return this.oderDetailService.create(createOderDetailDto);
  // }

  // @Get()
  // findAll() {
  //   return this.oderDetailService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.oderDetailService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOderDetailDto: UpdateOderDetailDto) {
  //   return this.oderDetailService.update(+id, updateOderDetailDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.oderDetailService.remove(+id);
  // }
}
