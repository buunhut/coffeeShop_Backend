import { Injectable } from '@nestjs/common';
import {
  CreateMenuItemDto,
  DeleteMenuItemDto,
  UpdateMenuItemDto,
} from './dto/create-menu-item.dto';
import { ExtraService } from 'src/service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class MenuItemService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  async create(token: string, body: CreateMenuItemDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      // console.log(shopId);
      if (shopId) {
        const count = await prisma.menuItem.count({
          where: {
            shopId,
          },
        });
        // console.log(count);
        const data = {
          ...body,
          menuName: 'móm mới ' + (count + 1),
          menuPrice: 0,
          menuDiscount: 0,
          shopId,
        };
        const create = await prisma.menuItem.create({
          data,
        });
        if (create) {
          const {
            menuId,
            menuName,
            menuImage,
            menuPrice,
            menuDiscount,
            menuNote,
          } = create;
          const res = {
            menuId,
            menuName,
            menuImage,
            menuPrice,
            menuDiscount,
            menuNote,
          };
          return this.extraService.response(200, 'đã tạo menu', res);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async update(token: string, body: UpdateMenuItemDto) {
    try {
      const shopId = await this.extraService.getShopId(token);

      if (shopId) {
        const { menuId, menuName } = body;
        const check = await prisma.menuItem.count({
          where: {
            menuName,
            shopId,
            isDelete: false,
            NOT: {
              menuId,
            },
          },
        });

        const { totalSale, ...dataNoTotalSale } = body;
        const data = dataNoTotalSale;

        if (check > 0) {
          return this.extraService.response(209, 'trùng tên món', menuName);
        } else {
          const update = await prisma.menuItem.update({
            where: {
              menuId,
              shopId,
            },
            data,
          });
          // console.log(update);

          if (update) {
            const res = {
              ...data,
              menuImage: update.menuImage,
            };
            return this.extraService.response(200, 'đã cập nhật', res);
          } else {
            return this.extraService.response(500, 'lỗi BE', null);
          }
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async delete(token: string, body: DeleteMenuItemDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const { menuId } = body;
        const deleteMenu = await prisma.menuItem.update({
          where: {
            menuId,
            shopId,
            // isDelete: false,
          },
          data: {
            isDelete: true,
          },
        });
        console.log(deleteMenu);
        if (deleteMenu) {
          return this.extraService.response(200, 'đã xoá', deleteMenu.menuName);
        } else {
          return this.extraService.response(404, 'not found', body);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  // findAll() {
  //   return `This action returns all menuItem`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} menuItem`;
  // }

  // update(id: number, updateMenuItemDto: UpdateMenuItemDto) {
  //   return `This action updates a #${id} menuItem`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} menuItem`;
  // }
}
