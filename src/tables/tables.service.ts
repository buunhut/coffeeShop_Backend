import { Shop } from './../shops/entities/shop.entity';
import { Injectable, Delete } from '@nestjs/common';
import { ExtraService } from 'src/service';
import { PrismaClient } from '@prisma/client';
import { DeleteTableDto, UpdateTableDto } from './dto/create-table.dto';
const prisma = new PrismaClient();
@Injectable()
export class TablesService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  async create(token: string) {
    try {
      const check = await this.extraService.checkAllow(token, prisma);
      if (!check) {
        return this.extraService.response(500, 'not allow', null);
      }

      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const create = await prisma.tables.create({
          data: {
            shopId,
            tableName: 'bàn mới',
          },
        });
        if (create) {
          const { tableId, tableName, tableNote } = create;
          const res = { tableId, tableName, tableNote };
          return this.extraService.response(200, 'đã tạo bàn', res);
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

  async get(token: string) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const get = await prisma.tables.findMany({
          select: {
            tableId: true,
            tableName: true,
            tableNote: true,
          },
          where: {
            shopId,
            isDelete: false,
          },
        });
        return this.extraService.response(200, 'list table', get);
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async update(token: string, data: UpdateTableDto) {
    try {
      const check = await this.extraService.checkAllow(token, prisma);
      if (!check) {
        return this.extraService.response(500, 'not allow', null);
      }

      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const { tableId, tableName } = data;

        const count = await prisma.tables.count({
          where: {
            tableName,
            isDelete: false,
            shopId,
            NOT: {
              tableId,
            },
          },
        });
        if (count > 0) {
          return this.extraService.response(
            209,
            'tên bàn đã sử dụng',
            tableName,
          );
        } else {
          const update = await prisma.tables.update({
            where: {
              shopId,
              tableId,
            },
            data,
          });
          if (update) {
            return this.extraService.response(200, 'đã cập nhật table', data);
          } else {
            return this.extraService.response(404, 'not found', tableId);
          }
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async delete(token: string, data: DeleteTableDto) {
    try {
      const check = await this.extraService.checkAllow(token, prisma);
      if (!check) {
        return this.extraService.response(500, 'not allow', null);
      }

      const shopId = await this.extraService.getShopId(token);
      const { tableId } = data;
      if (shopId) {
        const deleteTable = await prisma.tables.update({
          where: {
            tableId,
            shopId,
          },
          data: {
            isDelete: true,
          },
        });
        if (deleteTable) {
          return this.extraService.response(
            200,
            'đã xoá bàn',
            deleteTable.tableName,
          );
        } else {
          return this.extraService.response(404, 'not found', tableId);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
}
