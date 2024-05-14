import { ApiProperty } from '@nestjs/swagger';

export class UpdateTableDto {
  @ApiProperty({ type: 'number' })
  tableId: number;
  @ApiProperty({ type: 'string' })
  tableName: string;
  @ApiProperty({ type: 'string' })
  tableNote: string;
}
export class DeleteTableDto {
  @ApiProperty({ type: 'number' })
  tableId: number;
}
