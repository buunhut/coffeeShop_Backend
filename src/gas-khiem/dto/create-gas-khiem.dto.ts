import { ApiProperty } from '@nestjs/swagger';

export class CreateGasKhiemDto {}
export class DangKyDto {
  @ApiProperty({ type: 'string' })
  userPhone: string;
  @ApiProperty({ type: 'string' })
  userPass: string;
  @ApiProperty({ type: 'string' })
  shopName: string;
  @ApiProperty({ type: 'string' })
  shopAddress: string;
}
export class DangNhapDto {
  @ApiProperty({ type: 'string' })
  userPhone: string;
  @ApiProperty({ type: 'string' })
  userPass: string;
}
export class DoiMatKhauDto {
  @ApiProperty({ type: 'string' })
  userPhone: string;
  @ApiProperty({ type: 'string' })
  oldUserPass: string;
  @ApiProperty({ type: 'string' })
  newUserPass: string;
}
export class QuenMatKhauDto {
  @ApiProperty({ type: 'string' })
  userPhone: string;
  @ApiProperty({ type: 'string' })
  shopName: string;
  @ApiProperty({ type: 'string' })
  shopAddress: string;
}
export class LoaiVoDto {
  @ApiProperty({ type: 'number' })
  loaiVoId: number;
  @ApiProperty({ type: 'string' })
  loaiVoName: string;
  @ApiProperty({ type: 'number' })
  giaVo: number;
}
export class DanhMucDto {
  @ApiProperty({ type: 'number' })
  danhMucId: number;
  @ApiProperty({ type: 'string' })
  danhMucName: string;
  @ApiProperty({ type: 'number' })
  imageId: number;
}
export class TaoSanPhamDto {
  @ApiProperty({ type: 'number' })
  danhMucId: number;
}
export class SuaSanPhamDto {
  @ApiProperty({ type: 'number' })
  sanPhamId: number;
  @ApiProperty({ type: 'string' })
  tenSanPham: string;
  @ApiProperty({ type: 'number' })
  giaNhap: number;
  @ApiProperty({ type: 'number' })
  giaDoi: number;
  @ApiProperty({ type: 'number' })
  giaDoiGan: number;
  @ApiProperty({ type: 'number' })
  giaDoiXa: number;
  // @ApiProperty({ type: 'number' })
  // giaVo: number;
  @ApiProperty({ type: 'string' })
  loaiVo: string;
  @ApiProperty({ type: 'number' })
  imageId: number;
  // @ApiProperty({ type: 'number' })
  // danhMucId: number;
  @ApiProperty({ type: 'number' })
  loaiVoId: number;
}
export class XoaSanPhamDto {
  @ApiProperty({ type: 'number' })
  sanPhamId: number;
}
export class TimSanPhamDto {
  @ApiProperty({ type: 'string' })
  keyword: string;
}
export class TimDoiTacDto {
  @ApiProperty({ type: 'string' })
  keyword: string;
}
export class XoaDoiTacDto {
  @ApiProperty({ type: 'number' })
  doiTacId: number;
}
export class SuaDoiTacDto {
  @ApiProperty({ type: 'number' })
  doiTacId: number;
  @ApiProperty({ type: 'string' })
  tenDoiTac: string;
  @ApiProperty({ type: 'string' })
  diaChiDoiTac: string;
  @ApiProperty({ type: 'string' })
  soDienThoaiDoiTac: string;
  @ApiProperty({ type: 'string' })
  viTri: string;
  @ApiProperty({ type: 'string' })
  loaiDoiTac: string;
  @ApiProperty({ type: 'number' })
  imageId: number;
}
export class DonHangDto {
  @ApiProperty({ type: 'string' })
  tenDoiTac: string;
  @ApiProperty({ type: 'string' })
  loaiPhieu: string;
  @ApiProperty({ type: 'string' })
  giaoDich: string;
  @ApiProperty({ type: 'number' })
  doiTacId: number;
}
export class SortDonHangDto {
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-01-20',
  })
  fromDay: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-12-31',
  })
  toDay: Date;
  @ApiProperty({ type: 'number' })
  doiTacId: number;
  @ApiProperty({ type: 'number' })
  sanPhamId: number;
  @ApiProperty({ type: 'string' })
  example: 'px';
  loaiPhieu: string;
}

export class LuuDonHangDto {
  @ApiProperty({ type: 'number' })
  donHangId: number;
  @ApiProperty({ type: 'string' })
  ghiChu: string;
}
export class XoaDonHangDto {
  @ApiProperty({ type: 'number' })
  donHangId: number;
}
export class ChiTietDto {
  @ApiProperty({ type: 'string' })
  tenSanPham: string;
  @ApiProperty({ type: 'number' })
  donGia: number;
  @ApiProperty({ type: 'number' })
  soLuong: number;
  @ApiProperty({ type: 'string' })
  loaiVo: string;
  @ApiProperty({ type: 'number' })
  loaiVoId: number;
  @ApiProperty({ type: 'number' })
  sanPhamId: number;
  @ApiProperty({ type: 'number' })
  donHangId: number;
}
export class XoaChiTietDto {
  @ApiProperty({ type: 'number' })
  chiTietId: number;
}
export class SuaChiTietDto {
  @ApiProperty({ type: 'number' })
  chiTietId: number;
  @ApiProperty({ type: 'string' })
  tenSanPham: string;
  @ApiProperty({ type: 'number' })
  donGia: number;
  @ApiProperty({ type: 'number' })
  soLuong: number;
  @ApiProperty({ type: 'string' })
  loaiVo: string;
  @ApiProperty({ type: 'number' })
  loaiVoId: number;
  @ApiProperty({ type: 'number' })
  sanPhamId: number;
}
export class TraTienDto {
  @ApiProperty({ type: 'number' })
  donHangId: number;
  @ApiProperty({ type: 'number' })
  soTien: number;
}
export class SuaTraTienDto {
  @ApiProperty({ type: 'number' })
  traTienId: number;
  @ApiProperty({ type: 'number' })
  soTien: number;
}
export class XoaTraTienDto {
  @ApiProperty({ type: 'number' })
  traTienId: number;
}
export class TraVoDto {
  @ApiProperty({ type: 'string' })
  loaiVo: string;
  @ApiProperty({ type: 'number' })
  soLuong: number;
  @ApiProperty({ type: 'number' })
  loaiVoId: number;
  @ApiProperty({ type: 'number' })
  donHangId: number;
}
export class XoaTraVoDto {
  @ApiProperty({ type: 'number' })
  traVoId: number;
}
export class FilesUploadDto {
  @ApiProperty({ type: 'number' })
  sanPhamId: number;
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  images: any[];
}
