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
import { CategoryService } from './category.service';
import {
  DeleteCategoryDto,
  UpdateCategoryDto,
} from './dto/create-category.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/')
  create(@Headers('token') token: string) {
    return this.categoryService.create(token);
  }

  @Put('/')
  update(@Headers('token') token: string, @Body() body: UpdateCategoryDto) {
    return this.categoryService.update(token, body);
  }

  @Get('/')
  get(@Headers('token') token: string) {
    return this.categoryService.get(token);
  }
  @Delete('/')
  delete(@Headers('token') token: string, @Body() body: DeleteCategoryDto) {
    return this.categoryService.delete(token, body);
  }

  // @Get()
  // findAll() {
  //   return this.categoryService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoryService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   return this.categoryService.update(+id, updateCategoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoryService.remove(+id);
  // }
}
