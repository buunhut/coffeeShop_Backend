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
import { MenuItemService } from './menu-item.service';
import {
  CreateMenuItemDto,
  DeleteMenuItemDto,
  UpdateMenuItemDto,
} from './dto/create-menu-item.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('menu-item')
@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post('/')
  create(@Headers('token') token: string, @Body() body: CreateMenuItemDto) {
    return this.menuItemService.create(token, body);
  }

  @Put('/')
  update(@Headers('token') token: string, @Body() body: UpdateMenuItemDto) {
    return this.menuItemService.update(token, body);
  }

  @Delete('/')
  delete(@Headers('token') token: string, @Body() body: DeleteMenuItemDto) {
    return this.menuItemService.delete(token, body);
  }

  // @Get()xx
  // findAll() {xx
  //   return this.menuItemService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.menuItemService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateMenuItemDto: UpdateMenuItemDto,
  // ) {
  //   return this.menuItemService.update(+id, updateMenuItemDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.menuItemService.remove(+id);
  // }
}
