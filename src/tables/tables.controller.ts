import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Put,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { ApiTags } from '@nestjs/swagger';
import { DeleteTableDto, UpdateTableDto } from './dto/create-table.dto';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post('/')
  create(@Headers('token') token: string) {
    return this.tablesService.create(token);
  }

  @Get('/')
  get(@Headers('token') token: string) {
    return this.tablesService.get(token);
  }

  @Put('/')
  update(@Headers('token') token: string, @Body() body: UpdateTableDto) {
    return this.tablesService.update(token, body);
  }

  @Delete('/')
  delete(@Headers('token') token: string, @Body() body: DeleteTableDto) {
    return this.tablesService.delete(token, body);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.tablesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
  //   return this.tablesService.update(+id, updateTableDto);
  // }
}
