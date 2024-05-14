import { Injectable } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaClient } from '@prisma/client';
import { ExtraService } from 'src/service';

const prisma = new PrismaClient();

@Injectable()
export class StaffService {
  constructor(private readonly extraService: ExtraService) {}

  async create(token: string) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const date = new Date();
        const data = {
          shopId,
          staffPass: '123456',
          staffRole: [],
          staffDateStart: date,
        };

        const create = await prisma.staff.create({
          data,
        });
        if (create) {
          return this.extraService.response(200, 'đã thêm nv', create);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      } else {
        this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async findAll(token: string) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const staff = await prisma.staff.findMany({
          where: {
            shopId,
          },
          select: {
            staffId: true,
            staffName: true,
            staffPhone: true,
            staffPosition: true,
            staffAddress: true,
            staffDateStart: true,
            staffRole: true,
            staffNote: true,
            // shopId: true,
            // coffeeShop: {
            //   select: {
            //     shopName: true,
            //     shopPhone: true,
            //     shopAddress: true,
            //     shopImage: true,
            //   },
            // },
          },
          orderBy: {
            staffId: 'desc',
          },
        });
        return this.extraService.response(200, 'list nv', staff);
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async edit(token: string, body: CreateStaffDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const { staffId, staffPhone } = body;
        const checkPhone = await prisma.staff.findFirst({
          where: {
            staffPhone,
            isDelete: false,
            NOT: {
              staffId,
            },
          },
        });
        if (checkPhone) {
          return this.extraService.response(
            209,
            'số điện thoại đã được sử dụng',
            staffPhone,
          );
        } else {
          const edit = await prisma.staff.update({
            where: {
              staffId,
            },
            data: body,
          });
          if (edit) {
            return this.extraService.response(200, 'đã cập nhật nv', body);
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

  findOne(id: number) {
    return `This action returns a #${id} staff`;
  }

  update(id: number, updateStaffDto: UpdateStaffDto) {
    return `This action updates a #${id} staff`;
  }

  remove(id: number) {
    return `This action removes a #${id} staff`;
  }
}
