import { Injectable } from '@nestjs/common';
import { CreateStaffDto, DeleteStaffDto } from './dto/create-staff.dto';
import { PrismaClient } from '@prisma/client';
import { ExtraService } from 'src/service';

import * as moment from 'moment-timezone';

const prisma = new PrismaClient();

@Injectable()
export class StaffService {
  constructor(private readonly extraService: ExtraService) {}

  async create(token: string) {
    try {
      const check = await this.extraService.checkAllow(token, prisma);
      if (!check) {
        return this.extraService.response(500, 'not allow', null);
      }

      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const date = new Date();
        console.log('Current Date (UTC):', date);

        const timeZone = 'Asia/Ho_Chi_Minh';
        const vietnamTime = moment(date).tz(timeZone);

        console.log(
          'Vietnam Time (Formatted):',
          vietnamTime.format('YYYY-MM-DD HH:mm:ss'),
        );

        const vietnamTimeDate = vietnamTime.toDate();
        console.log('Vietnam Time (Date object):', vietnamTimeDate);

        const data = {
          shopId,
          staffPass: '123456',
          staffRole: [],
          staffDateStart: vietnamTimeDate,
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
      // const check = await this.extraService.checkAllow(token, prisma);
      // if (!check) {
      //   return this.extraService.response(500, 'not allow', null);
      // }

      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const staff = await prisma.staff.findMany({
          where: {
            shopId,
            isDelete: false,
          },
          select: {
            staffId: true,
            staffName: true,
            staffPhone: true,
            staffPass: true,
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
      const check = await this.extraService.checkAllow(token, prisma);
      if (!check) {
        return this.extraService.response(500, 'not allow', null);
      }

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

  async delete(token: string, body: DeleteStaffDto) {
    try {
      const check = await this.extraService.checkAllow(token, prisma);
      if (!check) {
        return this.extraService.response(500, 'not allow', null);
      }

      const { staffId } = body;
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const deleteStaff = await prisma.staff.update({
          where: {
            shopId,
            staffId,
            isDelete: false,
          },
          data: {
            isDelete: true,
          },
        });
        if (deleteStaff) {
          return this.extraService.response(
            200,
            'đã xoá',
            deleteStaff.staffName,
          );
        } else {
          return this.extraService.response(500, 'not found', null);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
}
