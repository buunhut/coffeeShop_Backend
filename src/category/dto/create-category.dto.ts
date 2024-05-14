import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ type: 'number' })
  shopId: number;
}
export class DeleteCategoryDto {
  @ApiProperty({ type: 'number' })
  categoryId: number;
}
export class UpdateCategoryDto {
  @ApiProperty({ type: 'number' })
  categoryId: number;
  @ApiProperty({ type: 'string' })
  categoryName: string;
}
