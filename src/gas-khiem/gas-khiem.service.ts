import { Injectable } from '@nestjs/common';
import {
  ChiTietDto,
  CreateGasKhiemDto,
  DangKyDto,
  DangNhapDto,
  DanhMucDto,
  DoiMatKhauDto,
  DonHangDto,
  FilesUploadDto,
  LoaiVoDto,
  LuuDonHangDto,
  QuenMatKhauDto,
  SortDonHangDto,
  SuaChiTietDto,
  SuaDoiTacDto,
  SuaSanPhamDto,
  SuaTraTienDto,
  TaoSanPhamDto,
  TimDoiTacDto,
  TimSanPhamDto,
  TraTienDto,
  TraVoDto,
  XoaChiTietDto,
  XoaDoiTacDto,
  XoaDonHangDto,
  XoaSanPhamDto,
  XoaTraTienDto,
  XoaTraVoDto,
} from './dto/create-gas-khiem.dto';
import { ExtraService } from 'src/service';
import { PrismaClient } from '@prisma/client';
import * as moment from 'moment';
import * as fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

@Injectable()
export class GasKhiemService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}
  //upload
  async uploadImage(
    token: string,
    body: FilesUploadDto,
    files: Express.Multer.File[],
  ) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const sanPhamId = +body.sanPhamId;
      const data = JSON.stringify(files.map((item) => item.filename));
      const upload = await prisma.gasImage.create({
        data: {
          imageName: data,
        },
      });
      const { imageId, imageName } = upload;

      const res = { imageId, imageName };
      await prisma.gasSanPham.update({
        where: {
          sanPhamId,
          userId,
          isDelete: false,
        },
        data: {
          imageId,
        },
      });
      return this.extraService.response(200, 'đã up hình', res);
    } catch (error) {
      console.log(error);
    }
  }
  async deleteImage(token: string, body: XoaSanPhamDto) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const { sanPhamId } = body;
      const sanPhamInfo = await prisma.gasSanPham.findFirst({
        where: {
          sanPhamId,
          userId,
          isDelete: false,
        },
        include: {
          gasImage: true,
        },
      });
      if (sanPhamInfo) {
        const imageNames = JSON.parse(sanPhamInfo.gasImage.imageName as string);
        imageNames?.forEach((item: string) => {
          const imagePath = process.cwd() + '/public/img/' + item;
          // Kiểm tra xem tệp hình ảnh tồn tại
          if (fs.existsSync(imagePath)) {
            // Xóa tệp hình ảnh
            fs.unlinkSync(imagePath);
          }
        });

        const deleteImg = await prisma.gasSanPham.update({
          where: {
            sanPhamId,
            userId,
            isDelete: false,
          },
          data: {
            imageId: null,
          },
        });
        if (deleteImg) {
          return this.extraService.response(200, 'đã xoá hình', sanPhamId);
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  // đăng ký - đăng nhập
  async dangKy(body: DangKyDto) {
    try {
      const { userPhone } = body;
      const checkPhone = await prisma.gasUser.findFirst({
        where: {
          userPhone,
          isDelete: false,
        },
      });
      if (checkPhone) {
        return this.extraService.response(
          209,
          'số điện thoại đã đăng ký',
          userPhone,
        );
      } else {
        const dangKy = await prisma.gasUser.create({
          data: body,
        });
        if (dangKy) {
          return this.extraService.response(200, 'đăng ký thành công', body);
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async dangNhap(body: DangNhapDto) {
    try {
      const { userPhone, userPass } = body;
      if (userPhone === null || userPass === null) {
        return this.extraService.response(500, 'lỗi FE', null);
      }
      const checkUserPhone = await prisma.gasUser.findFirst({
        where: {
          userPhone,
          isDelete: false,
        },
      });
      if (checkUserPhone) {
        const checkUserPass = await prisma.gasUser.findFirst({
          where: {
            userPass,
            userPhone,
            isDelete: false,
          },
        });
        if (checkUserPass) {
          const { userId, userPhone, shopName, shopAddress } = checkUserPass;
          const data = { userId, userPhone, shopName, shopAddress };
          const token = await this.extraService.signTokenGas(data, '730d');
          const res = { shopName, token };
          return this.extraService.response(200, 'đăng nhập thành công', res);
        } else {
          return this.extraService.response(
            404,
            'mật khẩu không đúng',
            userPass,
          );
        }
      } else {
        return this.extraService.response(
          404,
          'số điện thoại không đúng',
          userPhone,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async doiMatKhau(token: string, body: DoiMatKhauDto) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const { userPhone, oldUserPass, newUserPass } = body;
      const checkOldUserPass = await prisma.gasUser.findFirst({
        where: {
          userPhone,
          userPass: oldUserPass,
          userId,
          isDelete: false,
        },
      });
      if (checkOldUserPass) {
        const doiMatKhai = await prisma.gasUser.update({
          where: {
            userId,
          },
          data: {
            userPass: newUserPass,
          },
        });
        if (doiMatKhai) {
          return this.extraService.response(
            200,
            'đã đổi mật khẩu',
            newUserPass,
          );
        }
      } else {
        return this.extraService.response(404, 'sai mật khẩu', oldUserPass);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async quenMatKhau(body: QuenMatKhauDto) {
    try {
      const { userPhone, shopName, shopAddress } = body;
      const checkALl = await prisma.gasUser.findFirst({
        where: {
          userPhone,
          shopName,
          shopAddress,
          isDelete: false,
        },
      });
      if (checkALl) {
        const { userId } = checkALl;
        const timeRequest = new Date();
        const timeZone = 'Asia/Ho_Chi_Minh';
        const ngay = moment(timeRequest)
          .tz(timeZone)
          .format('YYYY-MM-DD HH:mm:ss');
        const data = { userId, ngay };

        const checkRequest = await prisma.gasQuenMatKhau.findFirst({
          where: {
            userId,
            trangThai: 'pending',
          },
        });
        if (checkRequest) {
          return this.extraService.response(200, 'vui lòng chờ', userPhone);
        } else {
          const ghiThongTin = await prisma.gasQuenMatKhau.create({
            data,
          });
          if (ghiThongTin) {
            return this.extraService.response(200, 'vui lòng chờ', userPhone);
          }
        }
      } else {
        return this.extraService.response(
          404,
          'thông tin không hợp lệ',
          userPhone,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  // loại vỏ
  async taoLoaiVo(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const taoLoiVo = await prisma.gasLoaiVo.create({
        data: { userId },
      });
      if (taoLoiVo) {
        return this.extraService.response(
          200,
          'đã tạo loại vỏ',
          taoLoiVo.loaiVoId,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docLoaiVo(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const listLoaiVo = await prisma.gasLoaiVo.findMany({
        where: {
          userId,
          isDelete: false,
        },
        select: {
          loaiVoId: true,
          loaiVoName: true,
          giaVo: true,
          tonKho: true,
        },
        orderBy: {
          loaiVoId: 'desc',
        },
      });
      return this.extraService.response(200, 'list loại vỏ', listLoaiVo);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async suaLoaiVo(token: string, body: LoaiVoDto) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const { loaiVoId } = body;
      const suaLoaiVo = await prisma.gasLoaiVo.update({
        where: {
          loaiVoId,
          userId,
          isDelete: false,
        },
        data: body,
      });
      if (suaLoaiVo) {
        return this.extraService.response(200, 'đã cập nhật', body);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async xoaLoaiVo(token: string, body: LoaiVoDto) {
    try {
      const { loaiVoId } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const xoaLoaiVo = await prisma.gasLoaiVo.update({
        where: {
          loaiVoId,
          userId,
          isDelete: false,
        },
        data: {
          isDelete: true,
        },
      });
      return this.extraService.response(200, 'đã xoá', body);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  // danh mục
  async taoDanhMuc(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const taoDanhMuc = await prisma.gasDanhMuc.create({
        data: { userId },
      });
      if (taoDanhMuc) {
        return this.extraService.response(
          200,
          'đã tạo danh mục',
          taoDanhMuc.danhMucId,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docDanhMuc(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const listDanhMuc = await prisma.gasDanhMuc.findMany({
        where: {
          userId,
          isDelete: false,
        },
        select: {
          danhMucId: true,
          danhMucName: true,
          gasImage: {
            select: {
              imageId: true,
              imageName: true,
            },
          },
          gasSanPham: {
            select: {
              sanPhamId: true,
              tenSanPham: true,
              giaNhap: true,
              giaDoi: true,
              giaDoiGan: true,
              giaDoiXa: true,
              loaiVo: true,
              loaiVoId: true,
              tonKho: true,
              gasImage: {
                select: {
                  imageId: true,
                  imageName: true,
                },
              },
              // gasLoaiVo: {
              //   select: {
              //     loaiVoId: true,
              //     loaiVoName: true,
              //     giaVo: true,
              //   },
              //   where: {
              //     isDelete: false,
              //   },
              // },
            },
            where: {
              isDelete: false,
            },
            orderBy: {
              sanPhamId: 'desc',
            },
          },
        },
        orderBy: {
          danhMucId: 'desc',
        },
      });

      const res = listDanhMuc.map((danhMuc) => {
        return {
          ...danhMuc,
          danhMucImage: danhMuc.gasImage,
          listSanPham: danhMuc.gasSanPham.map((sanPham) => {
            const { gasImage, ...restSanPham } = sanPham;
            let images = [];

            if (gasImage) {
              try {
                images = JSON.parse(gasImage.imageName as string);
              } catch (error) {
                console.error('Failed to parse imageName:', error);
              }
            }

            return {
              ...restSanPham,
              images: {
                imageId: gasImage?.imageId || null,
                imageName: images,
              },
            };
          }),
          gasImage: undefined, // Remove gasImage property
          gasSanPham: undefined, // Remove gasSanPham property
          gasLoaiVo: undefined, // Remove gasLoaiVo property
        };
      });

      return this.extraService.response(200, 'list danh mục', res);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async suaDanhMuc(token: string, body: DanhMucDto) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const { danhMucId, imageId } = body;
      const data = { ...body, imageId: imageId === 0 ? null : imageId };

      const suaDanhMuc = await prisma.gasDanhMuc.update({
        where: {
          danhMucId,
          userId,
          isDelete: false,
        },
        data,
      });
      if (suaDanhMuc) {
        return this.extraService.response(200, 'đã cập nhật', body);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async xoaDanhMuc(token: string, body: DanhMucDto) {
    try {
      const { danhMucId, danhMucName } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const xoaDanhMuc = await prisma.gasDanhMuc.update({
        where: {
          danhMucId,
          userId,
          isDelete: false,
        },
        data: {
          isDelete: true,
        },
      });
      if (xoaDanhMuc) {
        return this.extraService.response(200, 'đã xoá', danhMucName);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  // sản phẩm
  async taoSanPham(token: string, body: TaoSanPhamDto) {
    const { danhMucId } = body;
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const taoSanPham = await prisma.gasSanPham.create({
        data: {
          danhMucId,
          userId,
        },
      });
      if (taoSanPham) {
        return this.extraService.response(
          200,
          'đã tạo sản phẩm',
          taoSanPham.sanPhamId,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async timSanPham(token: string, body: TimSanPhamDto) {
    try {
      const { keyword } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const result = await prisma.gasSanPham.findMany({
        where: {
          tenSanPham: { contains: keyword },
          userId,
          isDelete: false,
        },
        select: {
          sanPhamId: true,
          tenSanPham: true,
          giaNhap: true,
          giaDoi: true,
          giaDoiGan: true,
          giaDoiXa: true,
          loaiVo: true,
          loaiVoId: true,
          gasImage: {
            select: {
              imageId: true,
              imageName: true,
            },
          },
        },
      });
      if (result.length > 0) {
        const res = result.map((item) => {
          return {
            ...item,
            sanPhamImage: item.gasImage,
            gasImage: undefined,
          };
        });
        return this.extraService.response(200, 'kết quá tìm được', res);
      } else {
        return this.extraService.response(200, 'kết quá tìm được', []);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docSanPham(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const docSanPham = await prisma.gasSanPham.findMany({
        where: {
          userId,
          isDelete: false,
        },
        select: {
          sanPhamId: true,
          tenSanPham: true,
          giaNhap: true,
          giaDoi: true,
          giaDoiGan: true,
          giaDoiXa: true,
          loaiVo: true,
          loaiVoId: true,
          tonKho: true,
          gasImage: {
            select: {
              imageId: true,
              imageName: true,
            },
          },
          gasLoaiVo: {
            select: {
              giaVo: true,
            },
            where: {
              isDelete: false,
            },
          },
        },
        orderBy: {
          sanPhamId: 'desc',
        },
      });
      const res = docSanPham.map((item) => {
        const { gasImage } = item;
        let images = [];

        if (gasImage) {
          try {
            images = JSON.parse(gasImage.imageName as string);
          } catch (error) {
            console.error('Failed to parse imageName:', error);
          }
        }

        return {
          ...item,
          images: {
            imageId: gasImage?.imageId || null,
            imageName: images,
          },
          giaVo: item.gasLoaiVo?.giaVo,
          gasImage: undefined,
          gasLoaiVo: undefined,
        };
      });
      // const res = docSanPham.map((item) => {
      //   return {
      //     ...item,
      //     listSanPham: danhMuc.gasSanPham.map((sanPham) => {
      //       const { gasImage, ...restSanPham } = sanPham;
      //       let images = [];

      //       if (gasImage) {
      //         try {
      //           images = JSON.parse(gasImage.imageName as string);
      //         } catch (error) {
      //           console.error('Failed to parse imageName:', error);
      //         }
      //       }

      //       return {
      //         ...restSanPham,
      //         images: {
      //           imageId: gasImage?.imageId || null,
      //           imageName: images,
      //         },
      //       };
      //     }),
      //     gasImage: undefined, // Remove gasImage property
      //     gasSanPham: undefined, // Remove gasSanPham property
      //     gasLoaiVo: undefined, // Remove gasLoaiVo property
      //   };
      // });

      // console.log(res);
      return this.extraService.response(200, 'list sản phẩm', res);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async suaSanPham(token: string, body: SuaSanPhamDto) {
    try {
      const { sanPhamId } = body;
      const data = {
        ...body,
        imageId: body.imageId === 0 ? null : body.imageId,
        // danhMucId: body.danhMucId === 0 ? null : body.danhMucId,
        loaiVoId: body.loaiVoId === 0 ? null : body.loaiVoId,
      };
      const userId = await this.extraService.getUserId(token);
      const suaSanPham = await prisma.gasSanPham.update({
        where: {
          sanPhamId,
          userId,
          isDelete: false,
        },
        data,
      });
      if (suaSanPham) {
        return this.extraService.response(200, 'đã cập nhật', body);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async xoaSanPham(token: string, body: XoaSanPhamDto) {
    try {
      const { sanPhamId } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const xoaSanPham = await prisma.gasSanPham.update({
        where: {
          sanPhamId,
          userId,
          isDelete: false,
        },
        data: {
          isDelete: true,
        },
      });
      if (xoaSanPham) {
        return this.extraService.response(
          200,
          'đã xoá sản phẩm',
          xoaSanPham.tenSanPham,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  // đối tác
  async taoDoiTacKhachHang(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const taoDoiTac = await prisma.gasDoiTac.create({
        data: { userId, loaiDoiTac: 'kh' },
      });
      if (taoDoiTac) {
        return this.extraService.response(
          200,
          'đã tạo khách hàng',
          taoDoiTac.doiTacId,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async taoDoiTacNhaPhanPhoi(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const taoDoiTac = await prisma.gasDoiTac.create({
        data: { userId, loaiDoiTac: 'npp' },
      });
      if (taoDoiTac) {
        return this.extraService.response(
          200,
          'đã tạo nhà phân phối',
          taoDoiTac.doiTacId,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docDoiTacKhachHang(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const info = await prisma.gasDoiTac.findMany({
        where: {
          loaiDoiTac: 'kh',
          isDelete: false,
          userId,
        },
        orderBy: {
          doiTacId: 'desc',
        },
        include: {
          gasDonHang: {
            where: {
              trangThai: 'saving',
              isDelete: false,
              userId,
            },
            orderBy: {
              donHangId: 'desc',
            },
            include: {
              gasChiTiet: {
                select: {
                  chiTietId: true,
                  tenSanPham: true,
                  soLuong: true,
                  donGia: true,
                  loaiVoId: true,
                  loaiVo: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraTien: {
                select: {
                  traTienId: true,
                  ngay: true,
                  soTien: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraVo: {
                select: {
                  traVoId: true,
                  ngay: true,
                  soLuong: true,
                  loaiVo: true,
                  loaiVoId: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
            },
          },
        },
      });
      if (info) {
        const khachHang = info?.map((item) => {
          const {
            tenDoiTac,
            doiTacId,
            soDienThoaiDoiTac,
            diaChiDoiTac,
            viTri,
            gasDonHang,
          } = item;
          const listPhieuNo = [];
          let tongTienNo = 0;
          let tongVoNo = 0;

          gasDonHang?.map((donHang) => {
            const {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              gasChiTiet: chiTiet,
              gasTraTien: traTien,
              gasTraVo: traVo,
            } = donHang;

            const tongTienHang = chiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            );
            const tongVo = chiTiet?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongTraTien = traTien?.reduce(
              (total, item) => total + item.soTien,
              0,
            );
            const tongTraVo = traVo?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const noTien = tongTienHang - tongTraTien;
            let noVo = 0;

            if (giaoDich === 'đổi') {
              noVo = tongVo - tongTraVo;
            }

            (tongTienNo += noTien), (tongVoNo += noVo);
            const donHangNoVoTien = {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              noTien,
              noVo,
              chiTiet,
              traTien,
              traVo,
            };
            listPhieuNo.push(donHangNoVoTien);
          });

          const data = {
            tenDoiTac,
            doiTacId,
            soDienThoaiDoiTac,
            diaChiDoiTac,
            viTri,
            tongTienNo,
            tongVoNo,
            listPhieuNo,
          };

          return data;
        });

        return this.extraService.response(
          200,
          'list khách hàng',
          khachHang || [],
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docKhachHangNo(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const info = await prisma.gasDoiTac.findMany({
        where: {
          loaiDoiTac: 'kh',
          isDelete: false,
          userId,
        },
        include: {
          gasDonHang: {
            where: {
              trangThai: 'saving',
              isDelete: false,
              userId,
            },
            // orderBy: {
            //   donHangId: 'desc',
            // },
            include: {
              gasChiTiet: {
                select: {
                  chiTietId: true,
                  tenSanPham: true,
                  soLuong: true,
                  donGia: true,
                  loaiVoId: true,
                  loaiVo: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraTien: {
                select: {
                  traTienId: true,
                  ngay: true,
                  soTien: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraVo: {
                select: {
                  traVoId: true,
                  ngay: true,
                  soLuong: true,
                  loaiVo: true,
                  loaiVoId: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
            },
          },
        },
      });
      if (info) {
        const khachHangNo = [];
        info?.map((item) => {
          const { tenDoiTac, doiTacId, viTri, soDienThoaiDoiTac, gasDonHang } =
            item;
          const listPhieuNo = [];
          let tongTienNo = 0;
          let tongVoNo = 0;

          gasDonHang.map((donHang) => {
            const {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              gasChiTiet: chiTiet,
              gasTraTien: traTien,
              gasTraVo: traVo,
            } = donHang;

            const tongTien = chiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            );
            const tongVo = chiTiet?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongTraTien = traTien?.reduce(
              (total, item) => total + item.soTien,
              0,
            );
            const tongTraVo = traVo?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongNoTien = tongTien - tongTraTien;
            let tongNoVo = 0;

            if (giaoDich === 'đổi') {
              tongNoVo = tongVo - tongTraVo;
            }

            if (tongNoTien !== 0 || tongNoVo !== 0) {
              (tongTienNo += tongNoTien), (tongVoNo += tongNoVo);
              const donHangNoVoTien = {
                donHangId,
                ngay,
                giaoDich,
                loaiPhieu,
                tongTien,
                tongVo,
                tongNoTien,
                tongNoVo,
                listChiTiet: chiTiet,
                listTraTien: traTien,
                listTraVo: traVo,
              };
              listPhieuNo.push(donHangNoVoTien);
            }
          });

          const data = {
            tenDoiTac,
            doiTacId,
            viTri,
            soDienThoaiDoiTac,
            tongTienNo,
            tongVoNo,
            listPhieuNo,
          };

          if (tongTienNo !== 0 || tongVoNo !== 0) {
            khachHangNo.push(data);
          }
        });

        return this.extraService.response(
          200,
          'list khách hàng nợ',
          khachHangNo || [],
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docNoNhaPhanPhoi(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const info = await prisma.gasDoiTac.findMany({
        where: {
          loaiDoiTac: 'npp',
          isDelete: false,
          userId,
        },
        include: {
          gasDonHang: {
            where: {
              trangThai: 'saving',
              isDelete: false,
              userId,
            },
            // orderBy: {
            //   donHangId: 'desc',
            // },
            include: {
              gasChiTiet: {
                select: {
                  chiTietId: true,
                  tenSanPham: true,
                  soLuong: true,
                  donGia: true,
                  loaiVoId: true,
                  loaiVo: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraTien: {
                select: {
                  traTienId: true,
                  ngay: true,
                  soTien: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraVo: {
                select: {
                  traVoId: true,
                  ngay: true,
                  soLuong: true,
                  loaiVo: true,
                  loaiVoId: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
            },
          },
        },
      });
      if (info) {
        const noNhaPhanPhoi = [];
        info?.map((item) => {
          const { tenDoiTac, doiTacId, viTri, soDienThoaiDoiTac, gasDonHang } =
            item;
          const listPhieuNo = [];
          let tongTienNo = 0;
          let tongVoNo = 0;

          gasDonHang.map((donHang) => {
            const {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              gasChiTiet: chiTiet,
              gasTraTien: traTien,
              gasTraVo: traVo,
            } = donHang;

            const tongTien = chiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            );
            const tongVo = chiTiet?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongTraTien = traTien?.reduce(
              (total, item) => total + item.soTien,
              0,
            );
            const tongTraVo = traVo?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongNoTien = tongTien - tongTraTien;
            let tongNoVo = 0;

            if (giaoDich === 'đổi') {
              tongNoVo = tongVo - tongTraVo;
            }

            if (tongNoTien !== 0 || tongNoVo !== 0) {
              (tongTienNo += tongNoTien), (tongVoNo += tongNoVo);
              const donHangNoVoTien = {
                donHangId,
                ngay,
                giaoDich,
                loaiPhieu,
                tongTien,
                tongVo,
                tongNoTien,
                tongNoVo,
                listChiTiet: chiTiet,
                listTraTien: traTien,
                listTraVo: traVo,
              };
              listPhieuNo.push(donHangNoVoTien);
            }
          });

          const data = {
            tenDoiTac,
            doiTacId,
            viTri,
            soDienThoaiDoiTac,
            tongTienNo,
            tongVoNo,
            listPhieuNo,
          };

          if (tongTienNo !== 0 || tongVoNo !== 0) {
            noNhaPhanPhoi.push(data);
          }
        });

        return this.extraService.response(
          200,
          'list nợ nhà phân phối',
          noNhaPhanPhoi || [],
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async docDoiTacNhaPhanPhoi(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const info = await prisma.gasDoiTac.findMany({
        where: {
          loaiDoiTac: 'npp',
          isDelete: false,
          userId,
        },
        orderBy: {
          doiTacId: 'desc',
        },
        include: {
          gasDonHang: {
            where: {
              trangThai: 'saving',
              isDelete: false,
              userId,
            },
            orderBy: {
              donHangId: 'desc',
            },
            include: {
              gasChiTiet: {
                select: {
                  chiTietId: true,
                  tenSanPham: true,
                  soLuong: true,
                  donGia: true,
                  loaiVoId: true,
                  loaiVo: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraTien: {
                select: {
                  traTienId: true,
                  ngay: true,
                  soTien: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraVo: {
                select: {
                  traVoId: true,
                  ngay: true,
                  soLuong: true,
                  loaiVo: true,
                  loaiVoId: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
            },
          },
        },
      });
      if (info) {
        const nhaPhanPhoi = info?.map((item) => {
          const {
            tenDoiTac,
            doiTacId,
            soDienThoaiDoiTac,
            diaChiDoiTac,
            viTri,
            gasDonHang,
          } = item;
          const listPhieuNo = [];
          let tongTienNo = 0;
          let tongVoNo = 0;

          gasDonHang?.map((donHang) => {
            const {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              gasChiTiet: chiTiet,
              gasTraTien: traTien,
              gasTraVo: traVo,
            } = donHang;

            const tongTienHang = chiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            );
            const tongVo = chiTiet?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongTraTien = traTien?.reduce(
              (total, item) => total + item.soTien,
              0,
            );
            const tongTraVo = traVo?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const noTien = tongTienHang - tongTraTien;
            let noVo = 0;

            if (giaoDich === 'đổi') {
              noVo = tongVo - tongTraVo;
            }

            (tongTienNo += noTien), (tongVoNo += noVo);
            const donHangNoVoTien = {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              noTien,
              noVo,
              chiTiet,
              traTien,
              traVo,
            };
            listPhieuNo.push(donHangNoVoTien);
          });

          const data = {
            tenDoiTac,
            doiTacId,
            soDienThoaiDoiTac,
            diaChiDoiTac,
            viTri,
            tongTienNo,
            tongVoNo,
            listPhieuNo,
          };

          return data;
        });

        return this.extraService.response(
          200,
          'list nhà phân phối',
          nhaPhanPhoi || [],
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async timDoiTacKhachHang(token: string, body: TimDoiTacDto) {
    try {
      const { keyword } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const result = await prisma.gasDoiTac.findMany({
        where: {
          tenDoiTac: {
            contains: keyword,
          },
          loaiDoiTac: 'kh',
          userId,
          isDelete: false,
        },
        select: {
          doiTacId: true,
          tenDoiTac: true,
          diaChiDoiTac: true,
          soDienThoaiDoiTac: true,
          viTri: true,
          gasImage: {
            select: {
              imageId: true,
              imageName: true,
            },
            where: {
              isDelete: false,
            },
          },
        },
        orderBy: {
          doiTacId: 'desc',
        },
      });
      if (result.length > 0) {
        const res = result.map((doiTac) => {
          return {
            ...doiTac,
            doiTacImage: doiTac.gasImage,
            gasImage: undefined,
          };
        });
        return this.extraService.response(200, 'kết quả tìm kiếm', res);
      } else {
        return this.extraService.response(200, 'kết quả tìm kiếm', []);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async timDoiTacNhaPhanPhoi(token: string, body: TimDoiTacDto) {
    try {
      const { keyword } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const result = await prisma.gasDoiTac.findMany({
        where: {
          tenDoiTac: {
            contains: keyword,
          },
          loaiDoiTac: 'npp',
          userId,
          isDelete: false,
        },
        select: {
          doiTacId: true,
          tenDoiTac: true,
          diaChiDoiTac: true,
          soDienThoaiDoiTac: true,
          viTri: true,
          gasImage: {
            select: {
              imageId: true,
              imageName: true,
            },
            where: {
              isDelete: false,
            },
          },
        },
        orderBy: {
          doiTacId: 'desc',
        },
      });
      if (result.length > 0) {
        const res = result.map((doiTac) => {
          return {
            ...doiTac,
            doiTacImage: doiTac.gasImage,
            gasImage: undefined,
          };
        });
        return this.extraService.response(200, 'kết quả tìm kiếm', res);
      } else {
        return this.extraService.response(200, 'kết quả tìm kiếm', []);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async timDoiTacKhachHangNo(token: string, body: TimDoiTacDto) {
    try {
      const { keyword } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const info = await prisma.gasDoiTac.findMany({
        where: {
          loaiDoiTac: 'kh',
          isDelete: false,
          userId,
          OR: [
            {
              tenDoiTac: {
                contains: keyword,
              },
            },
            {
              soDienThoaiDoiTac: {
                contains: keyword,
              },
            },
            {
              diaChiDoiTac: {
                contains: keyword,
              },
            },
          ],
        },
        include: {
          gasDonHang: {
            where: {
              trangThai: 'saving',
              isDelete: false,
              userId,
            },
            // orderBy: {
            //   donHangId: 'desc',
            // },
            include: {
              gasChiTiet: {
                select: {
                  chiTietId: true,
                  tenSanPham: true,
                  soLuong: true,
                  donGia: true,
                  loaiVoId: true,
                  loaiVo: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraTien: {
                select: {
                  traTienId: true,
                  ngay: true,
                  soTien: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraVo: {
                select: {
                  traVoId: true,
                  ngay: true,
                  soLuong: true,
                  loaiVo: true,
                  loaiVoId: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
            },
          },
        },
      });
      if (info) {
        const khachHangNo = [];
        info?.map((item) => {
          const { tenDoiTac, doiTacId, viTri, soDienThoaiDoiTac, gasDonHang } =
            item;
          const listPhieuNo = [];
          let tongTienNo = 0;
          let tongVoNo = 0;

          gasDonHang.map((donHang) => {
            const {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              gasChiTiet: chiTiet,
              gasTraTien: traTien,
              gasTraVo: traVo,
            } = donHang;

            const tongTien = chiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            );
            const tongVo = chiTiet?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongTraTien = traTien?.reduce(
              (total, item) => total + item.soTien,
              0,
            );
            const tongTraVo = traVo?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongNoTien = tongTien - tongTraTien;
            let tongNoVo = 0;

            if (giaoDich === 'đổi') {
              tongNoVo = tongVo - tongTraVo;
            }

            if (tongNoTien !== 0 || tongNoVo !== 0) {
              (tongTienNo += tongNoTien), (tongVoNo += tongNoVo);
              const donHangNoVoTien = {
                donHangId,
                ngay,
                giaoDich,
                loaiPhieu,
                tongTien,
                tongVo,
                tongNoTien,
                tongNoVo,
                listChiTiet: chiTiet,
                listTraTien: traTien,
                listTraVo: traVo,
              };
              listPhieuNo.push(donHangNoVoTien);
            }
          });

          const data = {
            tenDoiTac,
            doiTacId,
            viTri,
            soDienThoaiDoiTac,
            tongTienNo,
            tongVoNo,
            listPhieuNo,
          };

          if (tongTienNo !== 0 || tongVoNo !== 0) {
            khachHangNo.push(data);
          }
        });

        return this.extraService.response(
          200,
          'list khách hàng nợ',
          khachHangNo || [],
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async timDoiTacNoNhaPhanPhoi(token: string, body: TimDoiTacDto) {
    try {
      const { keyword } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const info = await prisma.gasDoiTac.findMany({
        where: {
          loaiDoiTac: 'npp',
          isDelete: false,
          userId,
          OR: [
            {
              tenDoiTac: {
                contains: keyword,
              },
            },
            {
              soDienThoaiDoiTac: {
                contains: keyword,
              },
            },
            {
              diaChiDoiTac: {
                contains: keyword,
              },
            },
          ],
        },
        include: {
          gasDonHang: {
            where: {
              trangThai: 'saving',
              isDelete: false,
              userId,
            },
            // orderBy: {
            //   donHangId: 'desc',
            // },
            include: {
              gasChiTiet: {
                select: {
                  chiTietId: true,
                  tenSanPham: true,
                  soLuong: true,
                  donGia: true,
                  loaiVoId: true,
                  loaiVo: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraTien: {
                select: {
                  traTienId: true,
                  ngay: true,
                  soTien: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
              gasTraVo: {
                select: {
                  traVoId: true,
                  ngay: true,
                  soLuong: true,
                  loaiVo: true,
                  loaiVoId: true,
                },
                where: {
                  isDelete: false,
                  userId,
                },
              },
            },
          },
        },
      });
      if (info) {
        const noNhaPhanPhoi = [];
        info?.map((item) => {
          const { tenDoiTac, doiTacId, viTri, soDienThoaiDoiTac, gasDonHang } =
            item;
          const listPhieuNo = [];
          let tongTienNo = 0;
          let tongVoNo = 0;

          gasDonHang.map((donHang) => {
            const {
              donHangId,
              ngay,
              giaoDich,
              loaiPhieu,
              gasChiTiet: chiTiet,
              gasTraTien: traTien,
              gasTraVo: traVo,
            } = donHang;

            const tongTien = chiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            );
            const tongVo = chiTiet?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongTraTien = traTien?.reduce(
              (total, item) => total + item.soTien,
              0,
            );
            const tongTraVo = traVo?.reduce(
              (total, item) => total + item.soLuong,
              0,
            );
            const tongNoTien = tongTien - tongTraTien;
            let tongNoVo = 0;

            if (giaoDich === 'đổi') {
              tongNoVo = tongVo - tongTraVo;
            }

            if (tongNoTien !== 0 || tongNoVo !== 0) {
              (tongTienNo += tongNoTien), (tongVoNo += tongNoVo);
              const donHangNoVoTien = {
                donHangId,
                ngay,
                giaoDich,
                loaiPhieu,
                tongTien,
                tongVo,
                tongNoTien,
                tongNoVo,
                listChiTiet: chiTiet,
                listTraTien: traTien,
                listTraVo: traVo,
              };
              listPhieuNo.push(donHangNoVoTien);
            }
          });

          const data = {
            tenDoiTac,
            doiTacId,
            viTri,
            soDienThoaiDoiTac,
            tongTienNo,
            tongVoNo,
            listPhieuNo,
          };

          if (tongTienNo !== 0 || tongVoNo !== 0) {
            noNhaPhanPhoi.push(data);
          }
        });

        return this.extraService.response(
          200,
          'list nợ nhà phân phối',
          noNhaPhanPhoi || [],
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async suaDoiTac(token: string, body: SuaDoiTacDto) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const { doiTacId, tenDoiTac, loaiDoiTac, imageId } = body;
      const data = {
        ...body,
        imageId: imageId === 0 ? null : imageId,
      };

      const checkDoiTac = await prisma.gasDoiTac.findFirst({
        where: {
          tenDoiTac,
          loaiDoiTac,
          userId,
          isDelete: false,
          NOT: { doiTacId },
        },
      });

      if (checkDoiTac) {
        return this.extraService.response(209, 'trùng tên khách hàng', body);
      }

      // console.log(data);

      await prisma.gasDoiTac.update({
        where: { doiTacId, userId, isDelete: false },
        data,
      });
      return this.extraService.response(200, 'đã cập nhật', body);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async xoaDoiTac(token: string, body: XoaDoiTacDto) {
    try {
      const { doiTacId } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const xoaDoiTac = await prisma.gasDoiTac.update({
        where: {
          doiTacId,
          userId,
          isDelete: false,
        },
        data: {
          isDelete: true,
        },
      });
      if (xoaDoiTac) {
        const { loaiDoiTac } = xoaDoiTac;
        if (loaiDoiTac === 'kh') {
          return this.extraService.response(
            200,
            'đã xoá khách hàng',
            xoaDoiTac.tenDoiTac,
          );
        } else {
          return this.extraService.response(
            200,
            'đã xoá nhà phân phối',
            xoaDoiTac.tenDoiTac,
          );
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  // đơn hàng
  //dùng đi dùng lại
  getDay() {
    const timeRequest = new Date();
    const timeZone = 'Asia/Ho_Chi_Minh';
    const ngay = moment(timeRequest).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    return ngay;
  }
  async getPhieuInfo(donHangId: number, userId: number) {
    const phieuInfo = await prisma.gasDonHang.findFirst({
      where: { donHangId, userId, isDelete: false },
      include: {
        gasChiTiet: { where: { donHangId, isDelete: false, userId } },
        gasTraTien: { where: { donHangId, isDelete: false, userId } },
        gasTraVo: { where: { donHangId, isDelete: false, userId } },
      },
    });
    const {
      ngay,
      tenDoiTac,
      doiTacId,
      loaiPhieu,
      giaoDich,
      trangThai,
      gasChiTiet,
      gasTraTien,
      gasTraVo,
    } = phieuInfo;

    const tongTien = gasChiTiet.reduce(
      (total, item) => total + item.soLuong * item.donGia,
      0,
    );
    const tongSoLuong = gasChiTiet.reduce(
      (total, item) => total + item.soLuong,
      0,
    );
    const tongVo = gasChiTiet.reduce((total, item) => {
      const { loaiVo } = item;
      if (loaiVo !== 'không' || loaiVo !== null) {
        return total + item.soLuong;
      }
    }, 0);

    const tongTraTien = gasTraTien.reduce(
      (total, item) => total + item.soTien,
      0,
    );
    const tongTraVo = gasTraVo.reduce((total, item) => total + item.soLuong, 0);
    const noTien = tongTien - tongTraTien;
    const noVo = giaoDich === 'đổi' ? tongVo - tongTraVo : 0;

    return {
      ngay,
      donHangId,
      tenDoiTac,
      doiTacId,
      loaiPhieu,
      giaoDich,
      trangThai,
      tongTien,
      tongVo,
      tongSoLuong,
      tongTraTien,
      tongTraVo,
      noTien,
      noVo,
      gasChiTiet,
      gasTraTien,
      gasTraVo,
    };
  }

  async handleXuLyVo(donHangId: number, userId: number) {
    const ngay = this.getDay();
    const phieuInfo = await this.getPhieuInfo(donHangId, userId);
    const { doiTacId, tenDoiTac, loaiPhieu, giaoDich, trangThai, gasTraVo } =
      phieuInfo;

    // Tính loại vỏ, xử lý phần vỏ
    const groupLoaiVo = await prisma.gasChiTiet
      .groupBy({
        by: ['loaiVo', 'loaiVoId'],
        where: { donHangId, userId, isDelete: false },
        _sum: { soLuong: true },
      })
      .then((res) =>
        res.map(({ _sum: { soLuong }, loaiVoId, loaiVo }) => ({
          loaiVoId,
          loaiVo,
          soLuong,
        })),
      );

    // Tìm list vỏ nợ
    const listNoVo = groupLoaiVo.map(({ loaiVoId, loaiVo, soLuong }) => {
      const matchingTraVo = gasTraVo.find((tra) => loaiVoId === tra.loaiVoId);
      const noVo = matchingTraVo ? soLuong - matchingTraVo.soLuong : soLuong;
      return {
        ngay,
        doiTacId,
        tenDoiTac,
        donHangId,
        loaiVoId,
        loaiVo,
        soLuong: noVo,
        userId,
      };
    });
    for (const item of listNoVo) {
      const { soLuong, loaiVoId } = item;
      if (soLuong > 0) {
        //ghi sổ
        if (giaoDich === 'đổi') {
          await prisma.gasTraVo.create({ data: item });
        }
        if (trangThai === 'saving') {
          await prisma.gasLoaiVo.update({
            where: { loaiVoId, userId, isDelete: false },
            data: {
              tonKho:
                loaiPhieu === 'px'
                  ? { increment: soLuong }
                  : { decrement: soLuong },
            },
          });
        }
      }
    }
    return loaiPhieu;
  }

  async handleXuLyTien(donHangId: number, userId: number) {
    const ngay = this.getDay();
    const phieuInfo = await this.getPhieuInfo(donHangId, userId);
    const { loaiPhieu, noTien } = phieuInfo;
    // Trả tiền
    if (noTien > 0) {
      await prisma.gasTraTien.create({
        data: { ngay, donHangId, soTien: noTien, userId },
      });
    }
    return loaiPhieu;
  }
  //tạo đơn hàng dùng chung cho phiếu xuất và phiếu nhập
  async taoDonHang(token: string, body: DonHangDto) {
    try {
      const { loaiPhieu, doiTacId, giaoDich } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const timeRequest = new Date();
      const timeZone = 'Asia/Ho_Chi_Minh';
      const ngay = moment(timeRequest)
        .tz(timeZone)
        .format('YYYY-MM-DD HH:mm:ss');
      const data = { ...body, ngay, userId, trangThai: 'pending' };

      const check = await prisma.gasDonHang.findFirst({
        where: {
          userId,
          doiTacId,
          trangThai: 'pending',
          giaoDich,
          isDelete: false,
        },
      });

      if (check) {
        return this.extraService.response(200, 'đã tạo đơn hàng', {
          loaiPhieu,
        });
      } else {
        const taoDonHang = await prisma.gasDonHang.create({
          data,
        });
        if (taoDonHang) {
          return this.extraService.response(200, 'đã tạo đơn hàng', {
            loaiPhieu,
          });
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  //lưu đơn hàng dùng chung cho phiếu xuất và phiếu nhập
  async luuDonHang(token: string, body: LuuDonHangDto) {
    try {
      const { donHangId, ghiChu } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const phieuInfo = await this.getPhieuInfo(donHangId, userId);

      if (phieuInfo) {
        await prisma.gasDonHang.update({
          where: {
            donHangId,
            userId,
            isDelete: false,
          },
          data: {
            trangThai: 'saving',
          },
        });

        const { loaiPhieu, giaoDich, gasChiTiet, gasTraVo } = phieuInfo;
        if (giaoDich === 'bán vỏ' || giaoDich === 'mua vỏ') {
          gasChiTiet.map(async (item) => {
            await prisma.gasLoaiVo.update({
              where: {
                loaiVoId: item.loaiVoId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho:
                  loaiPhieu === 'px'
                    ? { decrement: item.soLuong }
                    : { increment: item.soLuong },
              },
            });
          });
        } else {
          gasChiTiet.map(async (item) => {
            await prisma.gasSanPham.update({
              where: {
                sanPhamId: item.sanPhamId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho:
                  loaiPhieu === 'px'
                    ? { decrement: item.soLuong }
                    : { increment: item.soLuong },
              },
            });
          });

          gasTraVo.map(async (item) => {
            await prisma.gasLoaiVo.update({
              where: {
                loaiVoId: item.loaiVoId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho:
                  loaiPhieu === 'px'
                    ? { increment: item.soLuong }
                    : { decrement: item.soLuong },
              },
            });
          });
        }
        return this.extraService.response(200, 'đã lưu phiếu', { loaiPhieu });
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async docDonHangXuatPending(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const donHangInfo = await prisma.gasDonHang.findMany({
        where: {
          userId,
          loaiPhieu: 'px',
          trangThai: 'pending',
          isDelete: false,
        },
        select: {
          donHangId: true,
          ngay: true,
          doiTacId: true,
          tenDoiTac: true,
          loaiPhieu: true,
          giaoDich: true,
          trangThai: true,
          note: true,
          gasChiTiet: {
            select: {
              chiTietId: true,
              tenSanPham: true,
              sanPhamId: true,
              soLuong: true,
              donGia: true,
              loaiVo: true,
              loaiVoId: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
          gasTraTien: {
            select: {
              traTienId: true,
              ngay: true,
              soTien: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
          gasTraVo: {
            select: {
              traVoId: true,
              loaiVoId: true,
              loaiVo: true,
              soLuong: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
        },
        orderBy: {
          donHangId: 'desc',
        },
      });
      if (donHangInfo) {
        const res = donHangInfo.map((item) => {
          const { gasChiTiet, gasTraTien, gasTraVo, giaoDich } = item;

          const tongTien =
            gasChiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            ) || 0;
          const tongVo =
            gasChiTiet?.reduce(
              (total, item) =>
                item.loaiVo !== 'không' && item.loaiVo !== null
                  ? total + item.soLuong
                  : total + 0,
              0,
            ) || 0;

          const tongTraTien =
            gasTraTien?.reduce((total, item) => total + item.soTien, 0) || 0;
          const tongTraVo =
            gasTraVo?.reduce((total, item) => total + item.soLuong, 0) || 0;

          let tongNoVo = 0;
          if (giaoDich === 'đổi') {
            tongNoVo = tongVo - tongTraVo;
          }
          const tongNoTien = tongTien - tongTraTien;

          return {
            ...item,
            note: undefined,
            ghiChu: item.note,
            listChiTiet: gasChiTiet,
            listTraTien: gasTraTien,
            listTraVo: gasTraVo,
            tongTien,
            tongVo,
            tongTraTien,
            tongTraVo,
            tongNoTien,
            tongNoVo,
            gasChiTiet: undefined,
            gasTraTien: undefined,
            gasTraVo: undefined,
          };
        });
        return this.extraService.response(
          200,
          'list phiếu xuất đang giao',
          res,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docDonHangNhapPending(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const donHangInfo = await prisma.gasDonHang.findMany({
        where: {
          userId,
          loaiPhieu: 'pn',
          trangThai: 'pending',
          isDelete: false,
        },
        select: {
          donHangId: true,
          ngay: true,
          doiTacId: true,
          tenDoiTac: true,
          loaiPhieu: true,
          giaoDich: true,
          trangThai: true,
          note: true,
          gasChiTiet: {
            select: {
              chiTietId: true,
              tenSanPham: true,
              sanPhamId: true,
              soLuong: true,
              donGia: true,
              loaiVo: true,
              loaiVoId: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
          gasTraTien: {
            select: {
              traTienId: true,
              ngay: true,
              soTien: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
          gasTraVo: {
            select: {
              traVoId: true,
              loaiVoId: true,
              loaiVo: true,
              soLuong: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
        },
        orderBy: {
          donHangId: 'desc',
        },
      });
      if (donHangInfo) {
        const res = donHangInfo.map((item) => {
          const { gasChiTiet, gasTraTien, gasTraVo, giaoDich } = item;

          const tongTien =
            gasChiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            ) || 0;
          const tongVo =
            gasChiTiet?.reduce(
              (total, item) =>
                item.loaiVo !== 'không' && item.loaiVo !== null
                  ? total + item.soLuong
                  : total + 0,
              0,
            ) || 0;

          const tongTraTien =
            gasTraTien?.reduce((total, item) => total + item.soTien, 0) || 0;
          const tongTraVo =
            gasTraVo?.reduce((total, item) => total + item.soLuong, 0) || 0;

          let tongNoVo = 0;
          if (giaoDich === 'đổi') {
            tongNoVo = tongVo - tongTraVo;
          }
          const tongNoTien = tongTien - tongTraTien;

          return {
            ...item,
            note: undefined,
            ghiChu: item.note,
            listChiTiet: gasChiTiet,
            listTraTien: gasTraTien,
            listTraVo: gasTraVo,
            tongTien,
            tongVo,
            tongTraTien,
            tongTraVo,
            tongNoTien,
            tongNoVo,
            gasChiTiet: undefined,
            gasTraTien: undefined,
            gasTraVo: undefined,
          };
        });
        return this.extraService.response(
          200,
          'list phiếu xuất đang giao',
          res,
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docDonHangXuatNo(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);

      const info = await prisma.gasDoiTac.findMany({
        where: {
          loaiDoiTac: 'kh',
          isDelete: false,
          userId,
        },
        include: {
          gasDonHang: {
            where: {
              userId,
              trangThai: 'saving',
              isDelete: false,
            },
            orderBy: {
              donHangId: 'desc',
            },
            include: {
              gasChiTiet: {
                select: {
                  chiTietId: true,
                  tenSanPham: true,
                  soLuong: true,
                  donGia: true,
                  loaiVoId: true,
                  loaiVo: true,
                },
                where: {
                  userId,
                  isDelete: false,
                },
              },
              gasTraTien: {
                select: {
                  traTienId: true,
                  ngay: true,
                  soTien: true,
                },
                where: {
                  userId,
                  isDelete: false,
                },
              },
              gasTraVo: {
                select: {
                  traVoId: true,
                  ngay: true,
                  soLuong: true,
                  loaiVo: true,
                  loaiVoId: true,
                },
                where: {
                  userId,
                  isDelete: false,
                },
              },
            },
          },
        },
      });

      const khachHangNo = info.map((item) => {
        const { tenDoiTac, doiTacId, gasDonHang } = item;
        const listPhieuNo = [];
        gasDonHang.map((donHang) => {
          const {
            gasChiTiet: listChiTiet,
            gasTraTien: listTraTien,
            gasTraVo: listTraVo,
            giaoDich,
          } = donHang;

          const tongTien = listChiTiet?.reduce(
            (total, item) => total + item.soLuong * item.donGia,
            0,
          );
          const tongVo = listChiTiet?.reduce(
            (total, item) => total + item.soLuong,
            0,
          );
          const tongTraTien = listTraTien?.reduce(
            (total, item) => total + item.soTien,
            0,
          );
          const tongTraVo = listTraVo?.reduce(
            (total, item) => total + item.soLuong,
            0,
          );
          const tongNoTien = tongTien - tongTraTien;
          const tongNoVo = tongVo - tongTraVo;
          if (tongNoTien !== 0 || tongNoVo !== 0) {
            const donHangNoVoTien = {
              giaoDich,
              tongTien,
              tongVo,
              tongNoTien,
              tongNoVo,
              listChiTiet,
              listTraTien,
              listTraVo,
            };
            listPhieuNo.push(donHangNoVoTien);
          }
        });

        const data = {
          tenDoiTac,
          doiTacId,
          listPhieuNo,
        };

        // console.log(data);
        return data;
      });

      return this.extraService.response(200, 'list khách hàng nợ', khachHangNo);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async docDonHangByDay(token: string, body: SortDonHangDto) {
    try {
      const userId = await this.extraService.getUserId(token);
      let { fromDay, toDay, doiTacId, sanPhamId, loaiPhieu } = body;

      const from = fromDay ? `${fromDay} 00:00:00` : null;
      const to = toDay
        ? `${toDay} 23:59:59`
        : from
          ? `${fromDay} 23:59:59`
          : null;

      const ngay = from && to ? { gte: from, lt: to } : null;

      const result = await prisma.gasDonHang.findMany({
        where: {
          userId,
          isDelete: false,
          loaiPhieu,
          trangThai: 'saving',
          ...(ngay && { ngay }),
          ...(doiTacId && { doiTacId }),
        },
        include: {
          gasChiTiet: {
            select: {
              chiTietId: true,
              sanPhamId: true,
              tenSanPham: true,
              soLuong: true,
              donGia: true,
              loaiVo: true,
              loaiVoId: true,
            },
            where: {
              userId,
              isDelete: false,
              ...(sanPhamId && { sanPhamId }),
            },
          },
          gasTraTien: {
            select: {
              traTienId: true,
              ngay: true,
              soTien: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
          gasTraVo: {
            select: {
              traVoId: true,
              loaiVoId: true,
              loaiVo: true,
              soLuong: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
        },
        orderBy: {
          donHangId: 'desc',
        },
      });
      if (result) {
        const res = result.map((item) => {
          const { gasChiTiet, gasTraTien, gasTraVo, giaoDich } = item;

          const tongTien =
            gasChiTiet?.reduce(
              (total, item) => total + item.soLuong * item.donGia,
              0,
            ) || 0;
          const tongVo =
            gasChiTiet?.reduce(
              (total, item) =>
                item.loaiVo !== 'không' && item.loaiVo !== null
                  ? total + item.soLuong
                  : total + 0,
              0,
            ) || 0;

          const tongTraTien =
            gasTraTien?.reduce((total, item) => total + item.soTien, 0) || 0;
          const tongTraVo =
            gasTraVo?.reduce((total, item) => total + item.soLuong, 0) || 0;

          let tongNoVo = 0;
          if (giaoDich === 'đổi') {
            tongNoVo = tongVo - tongTraVo;
          }
          const tongNoTien = tongTien - tongTraTien;

          return {
            ...item,
            note: undefined,
            ghiChu: item.note,
            listChiTiet: gasChiTiet,
            listTraTien: gasTraTien,
            listTraVo: gasTraVo,
            tongTien,
            tongVo,
            tongTraTien,
            tongTraVo,
            tongNoTien,
            tongNoVo,
            gasChiTiet: undefined,
            gasTraTien: undefined,
            gasTraVo: undefined,
          };
        });

        return this.extraService.response(
          200,
          'kết quả',
          { res, loaiPhieu } || [],
        );
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async phieuTraDu(token: string, body: XoaDonHangDto) {
    try {
      const { donHangId } = body;
      const userId = await this.extraService.getUserIdGas(token);

      await this.handleXuLyTien(donHangId, userId);
      const res = await this.handleXuLyVo(donHangId, userId);

      return this.extraService.response(200, 'thu đủ tiền đủ vỏ', res);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  suaDonHang() {
    try {
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  //xoá đơn hàng dùng chung cho phiếu xuất và phiếu nhập
  async xoaDonHang(token: string, body: XoaDonHangDto) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const { donHangId } = body;
      const phieuInfo = await this.getPhieuInfo(donHangId, userId);
      const {
        loaiPhieu,
        giaoDich,
        trangThai,
        gasChiTiet,
        gasTraTien,
        gasTraVo,
      } = phieuInfo;

      if (trangThai === 'pending') {
        gasTraVo.map(async (item) => {
          await prisma.gasTraVo.update({
            where: {
              traVoId: item.traVoId,
              userId,
            },
            data: {
              isDelete: true,
            },
          });
        });
        gasTraTien.map(async (item) => {
          await prisma.gasTraTien.update({
            where: {
              traTienId: item.traTienId,
              userId,
            },
            data: {
              isDelete: true,
            },
          });
        });
        gasChiTiet.map(async (item) => {
          await prisma.gasChiTiet.update({
            where: {
              chiTietId: item.chiTietId,
              userId,
            },
            data: {
              isDelete: true,
            },
          });
        });
        await prisma.gasDonHang.update({
          where: {
            donHangId,
            userId,
            isDelete: false,
          },
          data: {
            isDelete: true,
          },
        });
        return this.extraService.response(200, 'đã xoá phiếu', loaiPhieu);
      } else if (trangThai === 'saving') {
        gasTraVo.map(async (item) => {
          await prisma.gasTraVo.update({
            where: {
              traVoId: item.traVoId,
              userId,
            },
            data: {
              isDelete: true,
            },
          });
          if (giaoDich === 'đổi') {
            await prisma.gasLoaiVo.update({
              where: {
                loaiVoId: item.loaiVoId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho:
                  loaiPhieu === 'px'
                    ? { decrement: item.soLuong }
                    : { increment: item.soLuong },
              },
            });
          }
        });
        gasTraTien.map(async (item) => {
          await prisma.gasTraTien.update({
            where: {
              traTienId: item.traTienId,
              userId,
            },
            data: {
              isDelete: true,
            },
          });
        });
        gasChiTiet.map(async (item) => {
          await prisma.gasChiTiet.update({
            where: {
              chiTietId: item.chiTietId,
              userId,
            },
            data: {
              isDelete: true,
            },
          });
          if (giaoDich === 'bán vỏ' || giaoDich === 'mua vỏ') {
            await prisma.gasLoaiVo.update({
              where: {
                loaiVoId: item.loaiVoId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho:
                  loaiPhieu === 'px'
                    ? { increment: item.soLuong }
                    : { decrement: item.soLuong },
              },
            });
          } else {
            await prisma.gasSanPham.update({
              where: {
                sanPhamId: item.sanPhamId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho:
                  loaiPhieu === 'px'
                    ? { increment: item.soLuong }
                    : { decrement: item.soLuong },
              },
            });
          }
        });
        await prisma.gasDonHang.update({
          where: {
            donHangId,
            userId,
            isDelete: false,
          },
          data: {
            isDelete: true,
          },
        });
        return this.extraService.response(200, 'đã xoá phiếu lưu', loaiPhieu);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  // chi Tiết
  async taoChiTiet(token: string, body: ChiTietDto) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const { sanPhamId, donHangId, donGia, soLuong } = body;
      const phieuInfo = await this.getPhieuInfo(donHangId, userId);
      const { loaiPhieu } = phieuInfo;
      const checkSanPhamExist = await prisma.gasChiTiet.findFirst({
        where: {
          donHangId,
          sanPhamId,
          donGia: donGia,
          isDelete: false,
        },
      });
      if (checkSanPhamExist) {
        const tangSoLuong = await prisma.gasChiTiet.update({
          where: {
            chiTietId: checkSanPhamExist.chiTietId,
            isDelete: false,
          },
          data: {
            soLuong: {
              increment: soLuong,
            },
          },
        });
        if (tangSoLuong) {
          const { soLuong } = tangSoLuong;
          const res = { ...body, soLuong };
          return this.extraService.response(200, 'đã tăng số lượng', {
            loaiPhieu,
          });
        }
      } else {
        const data = { ...body, soLuong, userId };
        const taoChiTiet = await prisma.gasChiTiet.create({
          data,
        });
        if (taoChiTiet) {
          return this.extraService.response(200, 'đã thêm chi tiết', {
            loaiPhieu,
          });
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  timChiTiet(body: CreateGasKhiemDto) {
    try {
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  docChiTiet() {
    try {
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async suaChiTiet(token: string, body: SuaChiTietDto) {
    try {
      const { chiTietId } = body;

      const userId = await this.extraService.getUserIdGas(token);
      const phieuInfo = await prisma.gasChiTiet.findFirst({
        where: {
          chiTietId,
          isDelete: false,
          userId,
        },
        select: {
          sanPhamId: true,
          loaiVoId: true,
          soLuong: true,
          gasDonHang: true,
        },
      });

      const { sanPhamId, loaiVoId, soLuong, gasDonHang } = phieuInfo;
      const { loaiPhieu, trangThai } = gasDonHang;
      if (gasDonHang.trangThai === 'saving') {
        const oldQty = soLuong;
        const newQty = body.soLuong;
        const updateQty = newQty - oldQty;
        if (
          gasDonHang.giaoDich === 'đổi' ||
          gasDonHang.giaoDich === 'bán' ||
          gasDonHang.giaoDich === 'mua'
        ) {
          await prisma.gasSanPham.update({
            where: {
              sanPhamId,
              userId,
              isDelete: false,
            },
            data: {
              tonKho:
                gasDonHang.loaiPhieu === 'px'
                  ? { decrement: updateQty }
                  : { increment: updateQty },
            },
          });
        } else if (
          gasDonHang.giaoDich === 'bán vỏ' ||
          gasDonHang.giaoDich === 'mua vỏ'
        ) {
          await prisma.gasLoaiVo.update({
            where: {
              loaiVoId,
              userId,
              isDelete: false,
            },
            data: {
              tonKho:
                gasDonHang.loaiPhieu === 'px'
                  ? { decrement: updateQty }
                  : { increment: updateQty },
            },
          });
        }
        await prisma.gasChiTiet.update({
          where: {
            chiTietId,
            isDelete: false,
            userId,
          },
          data: body,
        });
      } else {
        await prisma.gasChiTiet.update({
          where: {
            chiTietId,
            isDelete: false,
            userId,
          },
          data: body,
        });
      }
      return this.extraService.response(200, 'đã cập nhật', {
        loaiPhieu,
        trangThai,
      });
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async xoaChiTiet(token: string, body: XoaChiTietDto) {
    try {
      const { chiTietId } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const phieuInfo = await prisma.gasChiTiet.findFirst({
        where: {
          chiTietId,
          userId,
          isDelete: false,
        },
        select: {
          sanPhamId: true,
          loaiVoId: true,
          soLuong: true,
          gasDonHang: {
            select: {
              loaiPhieu: true,
              trangThai: true,
              giaoDich: true,
            },
            where: {
              userId,
              isDelete: false,
            },
          },
        },
      });
      const { sanPhamId, loaiVoId, soLuong } = phieuInfo;
      const { loaiPhieu, trangThai, giaoDich } = phieuInfo.gasDonHang;

      if (trangThai === 'saving') {
        if (giaoDich === 'đổi' || giaoDich === 'bán' || giaoDich === 'mua') {
          await prisma.gasSanPham.update({
            where: {
              sanPhamId,
              userId,
              isDelete: false,
            },
            data: {
              tonKho:
                loaiPhieu === 'px'
                  ? { increment: soLuong }
                  : { decrement: soLuong },
            },
          });
        } else if (giaoDich === 'bán vỏ' || giaoDich === 'mua vỏ') {
          await prisma.gasLoaiVo.update({
            where: {
              loaiVoId,
              userId,
              isDelete: false,
            },
            data: {
              tonKho:
                loaiPhieu === 'px'
                  ? { increment: soLuong }
                  : { decrement: soLuong },
            },
          });
        }
      }
      await prisma.gasChiTiet.update({
        where: {
          chiTietId,
          isDelete: false,
        },
        data: {
          isDelete: true,
        },
      });

      return this.extraService.response(200, 'đã xoá chi tiết', {
        loaiPhieu,
        trangThai,
      });
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  // trả tiền
  async taoTraTien(token: string, body: TraTienDto) {
    try {
      const { donHangId, soTien } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const phieuInfo = await prisma.gasDonHang.findFirst({
        where: {
          donHangId,
          userId,
          isDelete: false,
        },
        include: {
          gasChiTiet: {
            select: {
              donGia: true,
              soLuong: true,
            },
            where: {
              isDelete: false,
            },
          },
        },
      });

      if (phieuInfo) {
        const {
          donHangId,
          loaiPhieu,
          trangThai,
          doiTacId,
          tenDoiTac,
          gasChiTiet,
        } = phieuInfo;

        const timeRequest = new Date();
        const timeZone = 'Asia/Ho_Chi_Minh';
        const ngay = moment(timeRequest)
          .tz(timeZone)
          .format('YYYY-MM-DD HH:mm:ss');

        const tongTien = gasChiTiet.reduce(
          (total, item) => total + item.donGia * item.soLuong,
          0,
        );
        if (soTien > tongTien) {
          return this.extraService.response(
            200,
            'số tiền trả dư',
            soTien - tongTien,
          );
        } else {
          const data = {
            donHangId,
            ngay,
            doiTacId,
            tenDoiTac,
            soTien,
            userId,
          };
          await prisma.gasTraTien.create({ data });
          return this.extraService.response(200, 'đã lưu trả tiền', {
            loaiPhieu,
            trangThai,
          });
        }
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async docTraTien(token: string) {
    try {
      const userId = await this.extraService.getUserIdGas(token);
      const today = this.getDay();
      const ngay = {
        gte: moment(today).format('YYYY-MM-DD 00:00:00'),
        lt: moment(today).format('YYYY-MM-DD 23:59:59'),
      };

      const listTraTien = await prisma.gasTraTien.findMany({
        where: {
          userId,
          ngay,
          isDelete: false,
        },
        include: {
          gasDonHang: true,
        },
      });
      let tongThuTien = 0;
      let tongChiTien = 0;
      const listThuTien = [];
      const listChiTien = [];
      listTraTien?.map((item) => {
        const { traTienId, soTien, ngay, gasDonHang } = item;
        const { tenDoiTac } = gasDonHang;
        if (gasDonHang.loaiPhieu === 'px') {
          listThuTien.push({ traTienId, ngay, tenDoiTac, soTien });
          tongThuTien += soTien;
        } else {
          listChiTien.push({ traTienId, ngay, tenDoiTac, soTien });
          tongChiTien += soTien;
        }
      });
      const tongTienTrongNgay = tongThuTien - tongChiTien;
      return this.extraService.response(200, 'list trả tiền', {
        tongThuTien,
        listThuTien,
        tongChiTien,
        listChiTien,
        tongTienTrongNgay,
      });
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async suaTraTien(token: string, body: SuaTraTienDto) {
    try {
      const { traTienId } = body;
      const userId = await this.extraService.getUserId(token);
      await prisma.gasTraTien.update({
        where: {
          traTienId,
        },
        data: body,
      });
      // console.log(body);
      return this.extraService.response(200, 'đã cập nhật', body);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async xoaTraTien(token: string, body: XoaTraTienDto) {
    try {
      const { traTienId } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const phieuInfo = await prisma.gasTraTien.findFirst({
        where: {
          traTienId,
          userId,
          isDelete: false,
        },
        select: {
          soTien: true,
          gasDonHang: {
            select: {
              donHangId: true,
              loaiPhieu: true,
              trangThai: true,
            },
          },
        },
      });
      const { loaiPhieu, trangThai } = phieuInfo.gasDonHang;
      // console.log(phieuInfo);

      const xoaTraTien = await prisma.gasTraTien.update({
        where: {
          traTienId,
          isDelete: false,
          userId,
        },
        data: { isDelete: true },
      });
      return this.extraService.response(200, 'đã xoá trả tiền', {
        loaiPhieu,
        trangThai,
      });
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  // trả vỏ
  async taoTraVo(token: string, body: TraVoDto) {
    try {
      const { donHangId, loaiVo, loaiVoId, soLuong } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const thongTinDonHang = await prisma.gasDonHang.findFirst({
        where: {
          donHangId,
          userId,
          isDelete: false,
        },
        include: {
          gasChiTiet: {
            select: {
              loaiVo: true,
              loaiVoId: true,
              soLuong: true,
            },
            where: {
              isDelete: false,
            },
          },
        },
      });
      if (thongTinDonHang) {
        const {
          donHangId,
          loaiPhieu,
          trangThai,
          doiTacId,
          tenDoiTac,
          gasChiTiet,
        } = thongTinDonHang;

        if (trangThai === 'saving') {
          if (loaiPhieu === 'px') {
            await prisma.gasLoaiVo.update({
              where: {
                loaiVoId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho: {
                  increment: soLuong,
                },
              },
            });
          } else if (loaiPhieu === 'pn') {
            await prisma.gasLoaiVo.update({
              where: {
                loaiVoId,
                userId,
                isDelete: false,
              },
              data: {
                tonKho: {
                  decrement: soLuong,
                },
              },
            });
          }
        }

        const timeRequest = new Date();
        const timeZone = 'Asia/Ho_Chi_Minh';
        const ngay = moment(timeRequest)
          .tz(timeZone)
          .format('YYYY-MM-DD HH:mm:ss');

        const data = {
          donHangId,
          ngay,
          doiTacId,
          tenDoiTac,
          loaiVo,
          loaiVoId,
          soLuong,
          userId,
        };
        await prisma.gasTraVo.create({ data });
        return this.extraService.response(200, 'đã lưu trả vỏ', {
          trangThai,
          loaiPhieu,
        });
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async taoTraVoPhieuDaLuu(token: string, body: TraVoDto) {
    try {
      const { donHangId, loaiVo, loaiVoId, soLuong } = body;
      const userId = await this.extraService.getUserIdGas(token);
      const thongTinDonHang = await prisma.gasDonHang.findFirst({
        where: {
          donHangId,
          userId,
          isDelete: false,
        },
        include: {
          gasChiTiet: {
            select: {
              loaiVo: true,
              loaiVoId: true,
              soLuong: true,
            },
            where: {
              isDelete: false,
            },
          },
        },
      });
      if (thongTinDonHang) {
        const { donHangId, loaiPhieu, doiTacId, tenDoiTac, gasChiTiet } =
          thongTinDonHang;

        const timeRequest = new Date();
        const timeZone = 'Asia/Ho_Chi_Minh';
        const ngay = moment(timeRequest)
          .tz(timeZone)
          .format('YYYY-MM-DD HH:mm:ss');

        const data = {
          donHangId,
          ngay,
          doiTacId,
          tenDoiTac,
          loaiVo,
          loaiVoId,
          soLuong,
          userId,
        };
        await prisma.gasTraVo.create({ data });

        if (loaiPhieu === 'px') {
          await prisma.gasLoaiVo.update({
            where: {
              loaiVoId,
              isDelete: false,
              userId,
            },
            data: {
              tonKho: {
                increment: soLuong,
              },
            },
          });
        } else if (loaiPhieu === 'pn') {
          await prisma.gasLoaiVo.update({
            where: {
              loaiVoId,
              isDelete: false,
              userId,
            },
            data: {
              tonKho: {
                decrement: soLuong,
              },
            },
          });
        }

        return this.extraService.response(200, 'đã lưu trả vỏ', loaiPhieu);
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  docTraVo() {
    try {
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  suaTraVo() {
    try {
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
  async xoaTraVo(token: string, body: XoaTraVoDto) {
    try {
      const { traVoId } = body;

      const userId = await this.extraService.getUserIdGas(token);

      const phieuInfo = await prisma.gasTraVo.findFirst({
        where: {
          traVoId,
          userId,
          isDelete: false,
        },
        select: {
          loaiVoId: true,
          soLuong: true,
          gasDonHang: {
            select: {
              donHangId: true,
              loaiPhieu: true,
              trangThai: true,
            },
          },
        },
      });

      if (phieuInfo) {
        const { gasDonHang, loaiVoId, soLuong } = phieuInfo;
        const { trangThai, loaiPhieu } = gasDonHang;
        if (trangThai === 'saving') {
          await prisma.gasLoaiVo.update({
            where: {
              loaiVoId,
              userId,
              isDelete: false,
            },
            data: {
              tonKho:
                loaiPhieu === 'px'
                  ? {
                      decrement: soLuong,
                    }
                  : {
                      increment: soLuong,
                    },
            },
          });
        }
        const update = await prisma.gasTraVo.update({
          where: {
            traVoId,
            isDelete: false,
            userId,
          },
          data: {
            isDelete: true,
          },
        });
        return this.extraService.response(200, 'đã xoá trả vỏ', {
          trangThai,
          loaiPhieu,
        });
      }
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }
}
