import { Table } from './../tables/entities/table.entity';
import { OderDetail } from './../oder-detail/entities/oder-detail.entity';
import { Shop } from './../shops/entities/shop.entity';
import { Injectable, Body } from '@nestjs/common';
import {
  BillDto,
  CreateBillDto,
  GetBillDto,
  IncreaseDto,
  PayDto,
  TableSelectedDto,
  TableTransformDto,
} from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { ExtraService } from 'src/service';
import { PrismaClient } from '@prisma/client';
import * as moment from 'moment';
import { timeout } from 'rxjs';

const prisma = new PrismaClient();

@Injectable()
export class BillService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  async create(token: string, body: CreateBillDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const { tableId, order } = body;

        // console.log(body);

        // console.log(bill);
        const checkBill = await prisma.bill.findFirst({
          where: {
            tableId,
            shopId,
            status: 'serving',
            isDelete: false,
          },
        });
        if (checkBill) {
          const { billId, timeIn, timeOut, status } = checkBill;

          const { menuId } = order;
          const checkName = await prisma.orderDetail.findFirst({
            where: {
              billId,
              menuId,
              shopId,
              isDelete: false,
            },
          });
          if (checkName) {
            const updateQuantity = await prisma.orderDetail.update({
              where: {
                orderId: checkName.orderId,
              },
              data: {
                quantity: {
                  increment: 1,
                },
              },
            });
            return this.extraService.response(
              200,
              'đã tăng số lượng',
              checkName.name,
            );
          } else {
            const quantity = 1;
            const oderDetail = { ...order, quantity, billId, shopId };
            const createOrderDetail = await prisma.orderDetail.create({
              data: oderDetail,
            });
            const { name, price, orderId } = createOrderDetail;
            const res = {
              billId,
              timeIn,
              timeOut,
              status,
              tableId,
              orderDetail: {
                orderId,
                name,
                price,
                quantity,
              },
            };
            return this.extraService.response(200, 'đã tạo bill', res);
          }
        } else {
          const { staffName, staffId } = body.order;
          const timeIn = new Date();
          const timeZone = 'Asia/Ho_Chi_Minh';
          const stringTime = moment(timeIn)
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

          const bill = {
            tableId,
            timeIn: stringTime,
            timeOut: stringTime,
            shopId,
            status: 'serving',
            staffName,
            staffId,
          };
          const createBill = await prisma.bill.create({
            data: bill,
          });
          if (createBill) {
            const { billId, timeIn, timeOut, status, tableId } = createBill;
            const quantity = 1;
            const oderDetail = { ...order, quantity, billId, shopId };
            const createOrderDetail = await prisma.orderDetail.create({
              data: oderDetail,
            });
            const { name, price, orderId } = createOrderDetail;
            const res = {
              billId,
              timeIn,
              timeOut,
              status,
              tableId,
              orderDetail: {
                orderId,
                name,
                price,
                quantity,
              },
            };
            return this.extraService.response(200, 'đã tạo bill', res);
          }
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
        const oderDetail = await prisma.bill.findMany({
          select: {
            billId: true,
            timeIn: true,
            timeOut: true,
            status: true,
            billNote: true,
            tableId: true,
            orderDetail: {
              select: {
                orderId: true,
                name: true,
                quantity: true,
                price: true,
              },
              where: {
                isDelete: false,
              },
            },
          },
          where: {
            shopId,
            // status: 'serving',
          },
        });

        return this.extraService.response(200, 'list order', oderDetail);
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async getByDate(token: string, body: GetBillDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        let { fromDate, toDate, staffId } = body;

        const from = `${fromDate} 00:00:00`;
        const to = toDate ? `${toDate} 23:59:59` : `${fromDate} 23:59:59`;
        // console.log('form', from);
        // console.log('to', to);

        // Tính toán ngày bắt đầu và ngày kết thúc cho truy vấn
        // const toDateForQuery = toDate ? to : from;

        const bills = await prisma.bill.findMany({
          select: {
            billId: true,
            timeIn: true,
            timeOut: true,
            status: true,
            billNote: true,
            staffName: true,
            staffId: true,
            tables: {
              select: {
                tableId: true,
                tableName: true,
              },
            },
            orderDetail: {
              select: {
                orderId: true,
                name: true,
                quantity: true,
                price: true,
                staffName: true,
              },

              where: {
                isDelete: false,
              },
            },
          },

          where: {
            shopId,
            isDelete: false,
            timeIn: {
              gte: from,
              // lt: to,
            },
            timeOut: {
              // gte: from,

              lt: to,
            },
            ...(staffId && { staffId }),
          },
          orderBy: {
            billId: 'desc',
          },
        });

        const res = bills.map((item) => {
          if (item.status === 'serving') {
            return { ...item, timeOut: null };
          } else {
            return item;
          }
        });

        // console.log(res);

        const orderDetail = await prisma.orderDetail.groupBy({
          by: ['name'],
          _sum: {
            quantity: true,
          },
          where: {
            shopId,
            isDelete: false,
          },
        });

        return this.extraService.response(200, 'bills', res);
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async increase(token: string, body: IncreaseDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      const { orderId } = body;
      if (shopId) {
        const increase = await prisma.orderDetail.update({
          where: {
            orderId,
            shopId,
            isDelete: false,
          },
          data: {
            quantity: {
              increment: 1,
            },
          },
        });
        if (increase) {
          return this.extraService.response(200, 'đã tăng', increase.name);
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
  async decrease(token: string, body: IncreaseDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      const { orderId } = body;
      if (shopId) {
        const decrease = await prisma.orderDetail.update({
          where: {
            orderId,
            shopId,
            isDelete: false,
          },
          data: {
            quantity: {
              decrement: 1,
            },
          },
        });
        if (decrease) {
          return this.extraService.response(200, 'đã giảm', decrease.name);
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
  async deleteOrderItem(token: string, body: IncreaseDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      const { orderId } = body;
      if (shopId) {
        const deleteOrder = await prisma.orderDetail.update({
          where: {
            orderId,
            shopId,
            isDelete: false,
          },
          data: {
            isDelete: true,
          },
        });
        if (deleteOrder) {
          const { billId } = deleteOrder;
          const checkBill = await prisma.orderDetail.count({
            where: {
              shopId,
              billId,
              isDelete: false,
            },
          });
          if (checkBill === 0) {
            const deleteBill = await prisma.bill.update({
              where: {
                billId,
              },
              data: {
                status: 'delete',
              },
            });
          }

          return this.extraService.response(200, 'đã xoá', deleteOrder.name);
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
  async deleteBill(token: string, body: BillDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      const { billId } = body;
      let total = 0;

      if (shopId) {
        const readDetail = await prisma.orderDetail.findMany({
          select: {
            orderId: true,
            quantity: true,
            price: true,
          },
          where: {
            billId,
            shopId,
            isDelete: false,
          },
        });
        if (readDetail) {
          readDetail.map(async (item) => {
            total += item.quantity * item.price;
            await prisma.orderDetail.update({
              where: {
                orderId: item.orderId,
              },
              data: {
                isDelete: true,
              },
            });
          });
        }
        const timeOut = new Date();
        const timeZone = 'Asia/Ho_Chi_Minh';
        const stringTime = moment(timeOut)
          .tz(timeZone)
          .format('YYYY-MM-DD HH:mm:ss');

        const deleteBill = await prisma.bill.update({
          where: {
            billId,
            shopId,
            isDelete: false,
          },
          data: {
            total,
            status: 'delete',
            isDelete: true,
            timeOut: stringTime,
          },
        });
        if (deleteBill) {
          return this.extraService.response(200, 'đã xoá bill', {
            billId,
            total,
          });
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
  async tableTransform(token: string, body: TableTransformDto) {
    try {
      const shopId = await this.extraService.getShopId(token);
      if (shopId) {
        const { fromTableId, toTableId } = body;
        const fromTableDetail = await prisma.bill.findFirst({
          select: {
            billId: true,
            timeIn: true,
            timeOut: true,
            total: true,
            status: true,
            orderDetail: {
              select: {
                orderId: true,
                name: true,
                quantity: true,
                price: true,
                menuId: true,
              },
              where: {
                isDelete: false,
                shopId,
              },
            },
          },
          where: {
            tableId: fromTableId,
            status: 'serving',
            shopId,
          },
        });

        const toTableDetail = await prisma.bill.findFirst({
          select: {
            billId: true,
            timeIn: true,
            timeOut: true,
            total: true,
            status: true,
            orderDetail: {
              select: {
                orderId: true,
                name: true,
                quantity: true,
                price: true,
              },
              where: {
                isDelete: false,
                shopId,
              },
            },
          },
          where: {
            tableId: toTableId,
            status: 'serving',
            shopId,
          },
        });

        console.log('table to', toTableDetail);

        if (toTableDetail) {
          //nếu table to có dữ liệu thì xem như là ghép bàn
          fromTableDetail.orderDetail.map(async (item) => {
            //check xem item.menuId có chưa
            const check = await prisma.orderDetail.findFirst({
              where: {
                shopId,
                isDelete: false,
                menuId: item.menuId,
                billId: toTableDetail.billId,
              },
            });
            console.log('itemfrom', item);
            console.log('check ', check);

            if (check) {
              await prisma.orderDetail.update({
                where: {
                  orderId: check.orderId,
                  shopId,
                  isDelete: false,
                },
                data: {
                  quantity: {
                    increment: item.quantity,
                  },
                },
              });
              await prisma.orderDetail.update({
                where: {
                  orderId: item.orderId,
                  shopId,
                  isDelete: false,
                },
                data: {
                  quantity: 0,
                  isDelete: true,
                },
              });
            } else {
              await prisma.orderDetail.update({
                where: {
                  orderId: item.orderId,
                  shopId,
                  isDelete: false,
                },
                data: {
                  billId: toTableDetail.billId,
                },
              });
            }
          });

          const tableCompared = await prisma.bill.update({
            where: {
              billId: fromTableDetail.billId,
              shopId,
              isDelete: false,
            },
            data: {
              status: 'delete',
              isDelete: true,
            },
          });
          if (tableCompared) {
            return this.extraService.response(
              200,
              'đã chuyển đến bàn',
              toTableId,
            );
          }
        } else {
          //nếu table to null là trống thì xem như là chuyển bàn
          const change = await prisma.bill.update({
            where: {
              billId: fromTableDetail.billId,
            },
            data: {
              tableId: toTableId,
            },
          });
          if (change) {
            return this.extraService.response(
              200,
              'đã chuyển đến bàn',
              toTableId,
            );
          }
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async pay(token: string, body: PayDto) {
    try {
      const shopId = await this.extraService.getShopId(token);

      if (shopId) {
        const { billId, total } = body;
        const timeOut = new Date();
        const timeZone = 'Asia/Ho_Chi_Minh';
        const stringTime = moment(timeOut)
          .tz(timeZone)
          .format('YYYY-MM-DD HH:mm:ss');

        const data = { timeOut: stringTime, ...body, status: 'paid' };
        const pay = await prisma.bill.update({
          where: {
            billId,
            shopId,
            status: 'serving',
          },
          data,
        });
        if (pay) {
          return this.extraService.response(200, 'đã thanh toán', total);
        } else {
          return this.extraService.response(500, 'lỗi Be', null);
        }
      } else {
        return this.extraService.response(500, 'lỗi token', null);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  // async getTableServingDetail(token: string, body: TableSelectedDto) {
  //   try {
  //     const shopId = await this.extraService.getShopId(token);
  //     if (shopId) {
  //       const { tableId } = body;
  //       const getTableServingDetail = await prisma.bill.findFirst({
  //         where: {
  //           tableId,
  //           status: 'serving',
  //           shopId,
  //           isDelete: false,
  //         },
  //       });
  //     } else {
  //       return this.extraService.response(500, 'lỗi token', null);
  //     }
  //   } catch (error) {
  //     return this.extraService.response(500, 'lỗi BE', error);
  //   }
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} bill`;
  // }

  // update(id: number, updateBillDto: UpdateBillDto) {
  //   return `This action updates a #${id} bill`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} bill`;
  // }
}
