import { Injectable } from '@nestjs/common';
import {
  CheckPhoneDto,
  CreateShopDto,
  ShopLoginDto,
} from './dto/create-shop.dto';
import { ExtraService } from 'src/service';
import { PrismaClient } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

@Injectable()
export class ShopsService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  //đăng ký shop
  async create(data: CreateShopDto) {
    try {
      const { shopPhone } = data;
      const check = await prisma.coffeeShop.findFirst({
        where: {
          shopPhone,
          isDelete: false,
        },
      });
      if (check) {
        return this.extraService.response(
          209,
          'số điện thoại đã đăng ký',
          shopPhone,
        );
      } else {
        const create = await prisma.coffeeShop.create({
          data,
        });
        if (create) {
          const { shopName, shopAddress, shopPhone, shopId, shopPass } = create;
          const res = {
            shopName,
            shopAddress,
            shopPhone,
          };
          //ghi vào bảng nhân viên
          const date = new Date();
          const staff = {
            staffName: shopName,
            staffPhone: shopPhone,
            staffPass: shopPass,
            staffAddress: shopAddress,
            staffPosition: 'chủ quán',
            staffRole: ['admin'],
            staffDateStart: date,
            shopId,
          };
          const createStaff = await prisma.staff.create({
            data: staff,
          });
          if (createStaff) {
            return this.extraService.response(200, 'đăng ký thành công', res);
          } else {
            return this.extraService.response(500, 'lỗi BE', null);
          }
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  //check số điện thoại
  async checkPhone(body: CheckPhoneDto) {
    try {
      const { shopPhone } = body;
      const check = await prisma.coffeeShop.count({
        where: {
          shopPhone,
          isDelete: false,
        },
      });
      if (check > 0) {
        return this.extraService.response(
          209,
          'số điện thoại đã sử dụng',
          shopPhone,
        );
      } else {
        return this.extraService.response(
          200,
          'số điện thoại hợp lệ',
          shopPhone,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  //đăng nhập
  async login(data: ShopLoginDto) {
    try {
      const { shopPhone, shopPass } = data;
      if (shopPhone === null) {
        return this.extraService.response(500, 'nhập số đt', null);
      }
      const checkPhone = await prisma.staff.findFirst({
        where: {
          staffPhone: shopPhone,
          isDelete: false,
        },
      });
      if (!checkPhone) {
        return this.extraService.response(
          404,
          'số điện thoại chưa đăng ký',
          data,
        );
      } else {
        const checkPass = await prisma.staff.findFirst({
          where: {
            staffPass: shopPass,
            isDelete: false,
          },
        });
        if (!checkPass) {
          return this.extraService.response(404, 'sai mật khẩu', data);
        } else {
          const token = await this.extraService.signToken(checkPhone);
          const {
            shopId,
            staffName,
            staffAddress,
            staffPhone,
            staffRole,
            staffId,
          } = checkPhone;

          const shopInfo = await prisma.coffeeShop.findFirst({
            where: {
              shopId,
            },
            select: {
              shopName: true,
              shopAddress: true,
              shopPhone: true,
              shopImage: true,
            },
          });
          const res = {
            staffId,
            staffName,
            staffAddress,
            staffPhone,
            staffRole,
            shopId,
            shopInfo,
            token,
          };
          return this.extraService.response(200, 'đăng nhập thành công', res);
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
}
