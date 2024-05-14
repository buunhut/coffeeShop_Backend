import { MenuItem } from './../menu-item/entities/menu-item.entity';
import { Injectable, flatten } from '@nestjs/common';
import { ExtraService } from 'src/service';
import { PrismaClient } from '@prisma/client';
import {
  DeleteCategoryDto,
  UpdateCategoryDto,
} from './dto/create-category.dto';

const prisma = new PrismaClient();

@Injectable()
export class CategoryService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}
  async create(token: string) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const count = await prisma.category.count({
          where: {
            shopId,
          },
        });
        const categoryName = 'category ' + (count + 1);
        const create = await prisma.category.create({
          data: { shopId, categoryName },
        });
        if (create) {
          const { categoryId, categoryName, categoryImage, categoryNote } =
            create;
          const res = {
            categoryId,
            categoryName,
            categoryImage,
            categoryNote,
          };

          return this.extraService.response(200, 'đã thêm danh mục', res);
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

  async update(token: string, data: UpdateCategoryDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const { categoryId, categoryName } = data;
        const check = await prisma.category.findFirst({
          where: {
            categoryName,
            shopId,
            isDelete: false,
            NOT: { categoryId },
          },
        });

        if (check) {
          return this.extraService.response(
            209,
            'trùng tên danh mục',
            categoryName,
          );
        } else {
          //
          const update = await prisma.category.update({
            where: {
              categoryId,
              shopId,
            },
            data,
          });
          if (update) {
            const { categoryId, categoryName, categoryImage, categoryNote } =
              update;
            const res = {
              categoryId,
              categoryName,
              categoryImage,
              categoryNote,
            };
            return this.extraService.response(200, 'đã cập nhật', res);
          } else {
            return this.extraService.response(500, 'lỗi BE', null);
          }
          //
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async get(token: string) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const get = await prisma.category.findMany({
          select: {
            categoryId: true,
            categoryName: true,
            categoryImage: true,
            categoryNote: true,
            menuItem: {
              select: {
                menuId: true,
                menuName: true,
                menuImage: true,
                menuPrice: true,
                menuDiscount: true,
                menuNote: true,

                orderDetail: {
                  select: {
                    name: true,
                    quantity: true,
                  },
                },
              },
              where: {
                isDelete: false,
                shopId,
              },
              orderBy: {
                menuId: 'desc',
              },
            },
          },
          where: {
            shopId,
            isDelete: false,
          },
          orderBy: {
            categoryId: 'desc',
          },
        });

        const processedData = get.map((category) => ({
          ...category,
          menuItem: category.menuItem
            .map((menuItem) => ({
              ...menuItem,
              totalSale: menuItem.orderDetail.reduce(
                (total, order) => total + (order.quantity || 0),
                0,
              ),
            }))
            .map(({ orderDetail, ...rest }) => rest),
        }));

        const listMenu = await prisma.orderDetail.groupBy({
          by: ['menuId'],
          _sum: {
            quantity: true,
          },
        });

        // console.log(get);
        return this.extraService.response(200, 'caterogy', processedData);
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async delete(token: string, body: DeleteCategoryDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const { categoryId } = body;

        const findMenu = await prisma.menuItem.findMany({
          where: {
            categoryId,
            shopId,
            isDelete: false,
          },
        });
        if (findMenu.length > 0) {
          findMenu.map(async (findMenuItem) => {
            await prisma.menuItem.update({
              where: {
                menuId: +findMenuItem.menuId,
              },
              data: {
                isDelete: true,
              },
            });
          });
        }
        const deleteCategory = await prisma.category.update({
          where: {
            categoryId,
            shopId,
            isDelete: false,
          },
          data: {
            isDelete: true,
          },
        });
        if (deleteCategory) {
          return this.extraService.response(
            200,
            'đã xoá',
            deleteCategory.categoryName,
          );
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
}
