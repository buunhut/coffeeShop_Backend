import { ApiProperty } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ type: 'string' })
  shopName: string;
  @ApiProperty({ type: 'string' })
  shopAddress: string;
  @ApiProperty({ type: 'string' })
  shopPhone: string;
  @ApiProperty({ type: 'string' })
  shopPass: string;
}
export class ShopLoginDto {
  @ApiProperty({ type: 'string' })
  shopPhone: string;
  @ApiProperty({ type: 'string' })
  shopPass: string;
}
export class CheckPhoneDto {
  @ApiProperty({ type: 'string' })
  shopPhone: string;
}
