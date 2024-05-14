import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ type: 'number' })
  categoryId: number;
}
export class UpdateMenuItemDto {
  @ApiProperty({ type: 'number' })
  menuId: number;
  @ApiProperty({ type: 'string' })
  menuName: string;
  @ApiProperty({ type: 'number' })
  menuPrice: number;
  @ApiProperty({ type: 'number' })
  menuDiscount: number;
  @ApiProperty({ type: 'number' })
  totalSale: number;
  @ApiProperty({ type: 'string' })
  menuImage: string;
  @ApiProperty({ type: 'string' })
  menuNote: string;
}
export class DeleteMenuItemDto {
  @ApiProperty({ type: 'number' })
  menuId: number;
}
