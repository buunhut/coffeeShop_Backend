import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { GasKhiemService } from './gas-khiem.service';
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
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('gas')
@Controller('gas')
export class GasKhiemController {
  constructor(private readonly gasKhiemService: GasKhiemService) {}

  // hình ảnh
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor(
      'images',
      5, // Tham số 1: key FE gửi lên, và số lượng tối đa hình gửi lên
      {
        // Tham số 2: định nghĩa nơi lưu, và lưu tên mới cho file
        storage: diskStorage({
          destination: process.cwd() + '/public/img',
          filename: (req, file, callback) =>
            callback(null, new Date().getTime() + '_' + file.originalname), // null: tham số báo lỗi
        }),
      },
    ),
  )
  uploadImage(
    @Headers('token') token: string,
    @Body() body: FilesUploadDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.gasKhiemService.uploadImage(token, body, files);
  }

  @UseGuards(AuthGuard)
  @Delete('upload')
  deleteImage(@Headers('token') token: string, @Body() body: XoaSanPhamDto) {
    return this.gasKhiemService.deleteImage(token, body);
  }

  // đăng ký đăng nhập
  @Post('user/dang-ky')
  dangKy(@Body() body: DangKyDto) {
    return this.gasKhiemService.dangKy(body);
  }
  @Post('user/dang-nhap')
  dangNhap(@Body() body: DangNhapDto) {
    return this.gasKhiemService.dangNhap(body);
  }
  @UseGuards(AuthGuard)
  @Post('user/doi-mat-khau')
  doiMatKhau(@Headers('token') token: string, @Body() body: DoiMatKhauDto) {
    return this.gasKhiemService.doiMatKhau(token, body);
  }
  @Post('user/quen-mat-khau')
  quenMatKhau(@Body() body: QuenMatKhauDto) {
    return this.gasKhiemService.quenMatKhau(body);
  }

  // loai vỏ
  @UseGuards(AuthGuard)
  @Post('loai-vo')
  taoLoaiVo(@Headers('token') token: string) {
    return this.gasKhiemService.taoLoaiVo(token);
  }
  @UseGuards(AuthGuard)
  @Get('loai-vo')
  docLoaiVo(@Headers('token') token: string) {
    return this.gasKhiemService.docLoaiVo(token);
  }
  @UseGuards(AuthGuard)
  @Put('loai-vo')
  suaLoaiVo(@Headers('token') token: string, @Body() body: LoaiVoDto) {
    return this.gasKhiemService.suaLoaiVo(token, body);
  }
  @UseGuards(AuthGuard)
  @Delete('loai-vo')
  xoaLoaiVo(@Headers('token') token: string, @Body() body: LoaiVoDto) {
    return this.gasKhiemService.xoaLoaiVo(token, body);
  }
  // danh mục
  @UseGuards(AuthGuard)
  @Post('danh-muc')
  taoDanhMuc(@Headers('token') token: string) {
    return this.gasKhiemService.taoDanhMuc(token);
  }
  @UseGuards(AuthGuard)
  @Get('danh-muc')
  docDanhMuc(@Headers('token') token: string) {
    return this.gasKhiemService.docDanhMuc(token);
  }
  @UseGuards(AuthGuard)
  @Put('danh-muc')
  suaDanhMuc(@Headers('token') token: string, @Body() body: DanhMucDto) {
    return this.gasKhiemService.suaDanhMuc(token, body);
  }
  @UseGuards(AuthGuard)
  @Delete('danh-muc')
  xoaDanhMuc(@Headers('token') token: string, @Body() body: DanhMucDto) {
    return this.gasKhiemService.xoaDanhMuc(token, body);
  }
  // sản phẩm
  @UseGuards(AuthGuard)
  @Post('san-pham')
  taoSanPham(@Headers('token') token: string, @Body() body: TaoSanPhamDto) {
    return this.gasKhiemService.taoSanPham(token, body);
  }
  @UseGuards(AuthGuard)
  @Post('san-pham/tim-kiem')
  timSanPham(@Headers('token') token: string, @Body() body: TimSanPhamDto) {
    return this.gasKhiemService.timSanPham(token, body);
  }
  @UseGuards(AuthGuard)
  @Get('san-pham')
  docSanPham(@Headers('token') token: string) {
    return this.gasKhiemService.docSanPham(token);
  }
  @UseGuards(AuthGuard)
  @Put('san-pham')
  suaSanPham(@Headers('token') token: string, @Body() body: SuaSanPhamDto) {
    return this.gasKhiemService.suaSanPham(token, body);
  }
  @UseGuards(AuthGuard)
  @Delete('san-pham')
  xoaSanPham(@Headers('token') token: string, @Body() body: XoaSanPhamDto) {
    return this.gasKhiemService.xoaSanPham(token, body);
  }
  // đối tác
  @UseGuards(AuthGuard)
  @Post('doi-tac/khach-hang')
  taoDoiTacKhachHang(@Headers('token') token: string) {
    return this.gasKhiemService.taoDoiTacKhachHang(token);
  }
  @UseGuards(AuthGuard)
  @Get('doi-tac/khach-hang')
  docDoiTacKhachHang(@Headers('token') token: string) {
    return this.gasKhiemService.docDoiTacKhachHang(token);
  }
  @UseGuards(AuthGuard)
  @Get('doi-tac/khach-hang-no')
  docKhachHangNo(@Headers('token') token: string) {
    return this.gasKhiemService.docKhachHangNo(token);
  }
  @UseGuards(AuthGuard)
  @Get('doi-tac/no-nha-phan-phoi')
  docNoNhaPhanPhoi(@Headers('token') token: string) {
    return this.gasKhiemService.docNoNhaPhanPhoi(token);
  }
  @UseGuards(AuthGuard)
  @Post('doi-tac/nha-phan-Phoi')
  taoDoiTacNhaPhanPhoi(@Headers('token') token: string) {
    return this.gasKhiemService.taoDoiTacNhaPhanPhoi(token);
  }
  @UseGuards(AuthGuard)
  @Post('doi-tac/tim-kiem-khach-hang')
  timDoiTacKhachHang(
    @Headers('token') token: string,
    @Body() body: TimDoiTacDto,
  ) {
    return this.gasKhiemService.timDoiTacKhachHang(token, body);
  }
  @UseGuards(AuthGuard)
  @Post('doi-tac/tim-kiem-khach-hang-no')
  timDoiTacKhachHangNo(
    @Headers('token') token: string,
    @Body() body: TimDoiTacDto,
  ) {
    return this.gasKhiemService.timDoiTacKhachHangNo(token, body);
  }
  @UseGuards(AuthGuard)
  @Post('doi-tac/tim-kiem-no-nha-phan-phoi')
  timDoiTacNoNhaPhanPhoi(
    @Headers('token') token: string,
    @Body() body: TimDoiTacDto,
  ) {
    return this.gasKhiemService.timDoiTacNoNhaPhanPhoi(token, body);
  }
  @UseGuards(AuthGuard)
  @Post('doi-tac/tim-kiem-nha-phan-phoi')
  timDoiTacNhaPhanPhoi(
    @Headers('token') token: string,
    @Body() body: TimDoiTacDto,
  ) {
    return this.gasKhiemService.timDoiTacNhaPhanPhoi(token, body);
  }
  @UseGuards(AuthGuard)
  @Get('doi-tac/nha-phan-phoi')
  docDoiTacNhaPhanPhoi(@Headers('token') token: string) {
    return this.gasKhiemService.docDoiTacNhaPhanPhoi(token);
  }
  @UseGuards(AuthGuard)
  @Put('doi-tac')
  suaDoiTac(@Headers('token') token: string, @Body() body: SuaDoiTacDto) {
    return this.gasKhiemService.suaDoiTac(token, body);
  }
  @UseGuards(AuthGuard)
  @Delete('doi-tac')
  xoaDoiTac(@Headers('token') token: string, @Body() body: XoaDoiTacDto) {
    return this.gasKhiemService.xoaDoiTac(token, body);
  }
  // đơn hàng
  @UseGuards(AuthGuard)
  @Post('phieu')
  taoDonHang(@Headers('token') token: string, @Body() body: DonHangDto) {
    return this.gasKhiemService.taoDonHang(token, body);
  }
  // quan trọng, xử lý chức năng lưu đơn hàng
  @UseGuards(AuthGuard)
  @Post('phieu/luu-phieu')
  luuDonHang(@Headers('token') token: string, @Body() body: LuuDonHangDto) {
    return this.gasKhiemService.luuDonHang(token, body);
  }

  @UseGuards(AuthGuard)
  @Get('phieu-xuat-dang-giao')
  docDonHangXuatPending(@Headers('token') token: string) {
    return this.gasKhiemService.docDonHangXuatPending(token);
  }
  @UseGuards(AuthGuard)
  @Get('phieu-nhap-dang-giao')
  docDonHangNhapPending(@Headers('token') token: string) {
    return this.gasKhiemService.docDonHangNhapPending(token);
  }
  // @UseGuards(AuthGuard)
  // @Get('phieu-xuat-da-giao')
  // docDonHangXuatSaving(@Headers('token') token: string) {
  //   return this.gasKhiemService.docDonHangXuatSaving(token);
  // }
  @UseGuards(AuthGuard)
  @Get('phieu-xuat-no')
  docDonHangXuatNo(@Headers('token') token: string) {
    return this.gasKhiemService.docDonHangXuatNo(token);
  }
  @UseGuards(AuthGuard)
  @Post('phieu-xuat-by-day')
  docDonHangByDay(
    @Headers('token') token: string,
    @Body() body: SortDonHangDto,
  ) {
    return this.gasKhiemService.docDonHangByDay(token, body);
  }
  @UseGuards(AuthGuard)
  @Post('phieu-tra-du')
  phieuTraDu(@Headers('token') token: string, @Body() body: XoaDonHangDto) {
    return this.gasKhiemService.phieuTraDu(token, body);
  }
  @Put('phieu')
  suaDonHang() {
    return this.gasKhiemService.suaDonHang();
  }
  @Delete('phieu')
  xoaDonHang(@Headers('token') token: string, @Body() body: XoaDonHangDto) {
    return this.gasKhiemService.xoaDonHang(token, body);
  }
  // chi-tiet
  @UseGuards(AuthGuard)
  @Post('chi-tiet')
  taoChiTiet(@Headers('token') token: string, @Body() body: ChiTietDto) {
    return this.gasKhiemService.taoChiTiet(token, body);
  }
  @UseGuards(AuthGuard)
  @Post('chi-tiet/tim-kiem')
  timChiTiet(@Body() body: CreateGasKhiemDto) {
    return this.gasKhiemService.timChiTiet(body);
  }
  @UseGuards(AuthGuard)
  @Get('chi-tiet')
  docChiTiet() {
    return this.gasKhiemService.docChiTiet();
  }
  @UseGuards(AuthGuard)
  @Put('chi-tiet')
  suaChiTiet(@Headers('token') token: string, @Body() body: SuaChiTietDto) {
    return this.gasKhiemService.suaChiTiet(token, body);
  }
  @UseGuards(AuthGuard)
  @Delete('chi-tiet')
  xoaChiTiet(@Headers('token') token: string, @Body() body: XoaChiTietDto) {
    return this.gasKhiemService.xoaChiTiet(token, body);
  }
  // trả tiền
  @UseGuards(AuthGuard)
  @Post('tra-tien')
  taoTraTien(@Headers('token') token: string, @Body() body: TraTienDto) {
    return this.gasKhiemService.taoTraTien(token, body);
  }
  @UseGuards(AuthGuard)
  @Get('tra-tien')
  docTraTien(@Headers('token') token: string) {
    return this.gasKhiemService.docTraTien(token);
  }
  @UseGuards(AuthGuard)
  @Put('tra-tien')
  suaTraTien(@Headers('token') token: string, @Body() body: SuaTraTienDto) {
    return this.gasKhiemService.suaTraTien(token, body);
  }
  @UseGuards(AuthGuard)
  @Delete('tra-tien')
  xoaTraTien(@Headers('token') token: string, @Body() body: XoaTraTienDto) {
    return this.gasKhiemService.xoaTraTien(token, body);
  }
  // trả vỏ
  @UseGuards(AuthGuard)
  @Post('tra-vo')
  taoTraVo(@Headers('token') token: string, @Body() body: TraVoDto) {
    return this.gasKhiemService.taoTraVo(token, body);
  }
  // @UseGuards(AuthGuard)
  // @Post('tra-vo-phieu-da-luu')
  // taoTraVoPhieuDaLuu(@Headers('token') token: string, @Body() body: TraVoDto) {
  //   return this.gasKhiemService.taoTraVoPhieuDaLuu(token, body);
  // }
  @Get('tra-vo')
  docTraVo() {
    return this.gasKhiemService.docTraVo();
  }
  @Put('tra-vo')
  suaTraVo() {
    return this.gasKhiemService.suaTraVo();
  }
  @Delete('tra-vo')
  xoaTraVo(@Headers('token') token: string, @Body() body: XoaTraVoDto) {
    return this.gasKhiemService.xoaTraVo(token, body);
  }
}
