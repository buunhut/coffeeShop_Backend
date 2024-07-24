import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { NodejsService } from './nodejs.service';
import { CreateNodejDto, UploadImageDto } from './dto/create-nodej.dto';
import { UpdateNodejDto } from './dto/update-nodej.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('nodejs')
@Controller('nodejs')
export class NodejsController {
  constructor(private readonly nodejsService: NodejsService) {}

  @Post('/contact')
  create(@Body() body: CreateNodejDto) {
    return this.nodejsService.create(body);
  }

  @Get('/contact')
  getContact() {
    return this.nodejsService.getContact();
  }

  @Get('/teams')
  getTeams() {
    return this.nodejsService.getTeams();
  }

  //upload
  @ApiConsumes('multipart/form-data')
  @Post('/upload')
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
    @Body() body: UploadImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.nodejsService.uploadImage(body, file);
  }
}
