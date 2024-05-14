import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  DeleteImageDto,
  UploadImageDto,
} from './category/dto/upload-image.dto';
import { AuthGuard } from './service';

@UseGuards(AuthGuard)
@ApiTags('upload')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  //up hinh danh mục
  @ApiConsumes('multipart/form-data')
  @Post('/up-load-category-image')
  @UseInterceptors(
    //bắt key của dataForm gửi lên,
    FileInterceptor('image', {
      // Tham số 2: định nghĩa nơi lưu, và lưu tên mới cho file
      storage: diskStorage({
        destination: process.cwd() + '/public/img',
        filename: (req, file, callback) =>
          callback(null, new Date().getTime() + '_' + file.originalname), // null: tham số báo lỗi
      }),
    }),
  )
  uploadCategoryImage(
    @Headers('token') token: string,
    @Body() body: UploadImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.appService.uploadCategoryImage(token, body, file);
  }

  @Delete('delete-category-image')
  deleteCategoryImage(
    @Headers('token') token: string,
    @Body() body: DeleteImageDto,
  ) {
    return this.appService.deleteCategoryImage(token, body);
  }

  //up hinh menu
  @ApiConsumes('multipart/form-data')
  @Post('/up-load-menu-image')
  @UseInterceptors(
    //bắt key của dataForm gửi lên,
    FileInterceptor('image', {
      // Tham số 2: định nghĩa nơi lưu, và lưu tên mới cho file
      storage: diskStorage({
        destination: process.cwd() + '/public/img',
        filename: (req, file, callback) =>
          callback(null, new Date().getTime() + '_' + file.originalname), // null: tham số báo lỗi
      }),
    }),
  )
  uploadMenuImage(
    @Headers('token') token: string,
    @Body() body: UploadImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.appService.uploadMenuImage(token, body, file);
  }

  @Delete('delete-menu-image')
  deleteMenuImage(
    @Headers('token') token: string,
    @Body() body: DeleteImageDto,
  ) {
    return this.appService.deleteMenuImage(token, body);
  }
}
