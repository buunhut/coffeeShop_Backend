import { Injectable } from '@nestjs/common';
import {
  DeleteImageDto,
  UploadImageDto,
} from './category/dto/upload-image.dto';
import { ExtraService } from './service';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

@Injectable()
export class AppService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  async uploadCategoryImage(
    token: string,
    body: UploadImageDto,
    file: Express.Multer.File,
  ) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const categoryId = +body.id;
        const categoryImage = file.filename;
        const upLoadImage = await prisma.category.update({
          where: {
            categoryId,
            shopId,
          },
          data: {
            categoryImage,
          },
        });
        if (upLoadImage) {
          const { categoryId, categoryName, categoryImage, categoryNote } =
            upLoadImage;
          const res = {
            categoryId,
            categoryName,
            categoryImage,
            categoryNote,
          };
          return this.extraService.response(200, 'đã up hình', res);
        } else {
          return this.extraService.response(500, 'lỗi', null);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi', error);
    }
  }

  async deleteCategoryImage(token: string, body: DeleteImageDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const categoryId = body.id;
        const check = await prisma.category.findFirst({
          where: {
            categoryId,
            shopId,
            isDelete: false,
          },
        });
        if (check) {
          const { categoryImage } = check;
          // Xây dựng đường dẫn đầy đủ đến tệp hình ảnh trong thư mục public/img
          const imagePath = process.cwd() + '/public/img/' + categoryImage;

          const updateImage = await prisma.category.update({
            where: {
              categoryId,
              shopId,
              isDelete: false,
            },
            data: {
              categoryImage: null,
            },
          });
          if (updateImage) {
            // Kiểm tra xem tệp hình ảnh tồn tại
            if (fs.existsSync(imagePath)) {
              // Xóa tệp hình ảnh
              fs.unlinkSync(imagePath);
            }
            return this.extraService.response(
              200,
              'đã xoá hình',
              check.categoryName,
            );
          }
        } else {
          return this.extraService.response(404, 'not found', categoryId);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi', error);
    }
  }

  async uploadMenuImage(
    token: string,
    body: UploadImageDto,
    file: Express.Multer.File,
  ) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const menuId = +body.id;
        const menuImage = file.filename;
        const upLoadImage = await prisma.menuItem.update({
          where: {
            menuId,
            shopId,
          },
          data: {
            menuImage,
          },
        });
        if (upLoadImage) {
          const {
            menuId,
            menuName,
            menuImage,
            menuNote,
            menuPrice,
            menuDiscount,
          } = upLoadImage;
          const res = {
            menuId,
            menuName,
            menuImage,
            menuNote,
            menuPrice,
            menuDiscount,
          };
          return this.extraService.response(200, 'đã up hình', res);
        } else {
          return this.extraService.response(500, 'lỗi', null);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi', error);
    }
  }

  async deleteMenuImage(token: string, body: DeleteImageDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const menuId = body.id;
        const check = await prisma.menuItem.findFirst({
          where: {
            menuId,
            shopId,
            isDelete: false,
          },
        });
        if (check) {
          const { menuImage } = check;
          // Xây dựng đường dẫn đầy đủ đến tệp hình ảnh trong thư mục public/img
          const imagePath = process.cwd() + '/public/img/' + menuImage;

          const updateImage = await prisma.menuItem.update({
            where: {
              menuId,
              shopId,
              isDelete: false,
            },
            data: {
              menuImage: null,
            },
          });
          if (updateImage) {
            // Kiểm tra xem tệp hình ảnh tồn tại
            if (fs.existsSync(imagePath)) {
              // Xóa tệp hình ảnh
              fs.unlinkSync(imagePath);
            }
            return this.extraService.response(
              200,
              'đã xoá hình',
              check.menuName,
            );
          }
        } else {
          return this.extraService.response(404, 'not found', menuId);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi', error);
    }
  }

  //phần chat

  private messages: { id: string; text: string }[] = [];

  getMessages() {
    return this.messages;
  }

  addMessage(id: string, text: string): { id: string; text: string }[] {
    if (text) {
      this.messages.push({ id, text });
      return this.messages;
    }
  }
  clearMessages(): void {
    this.messages = [];
  }
}
