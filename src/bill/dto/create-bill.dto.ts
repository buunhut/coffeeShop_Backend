import { ApiProperty } from '@nestjs/swagger';

class OrderDetailDto {
  @ApiProperty({ type: 'number' })
  menuId: number;
  @ApiProperty({ type: 'string' })
  name: string;
  @ApiProperty({ type: 'number' })
  price: number;
  @ApiProperty({ type: 'string' })
  staffName: string;
  @ApiProperty({ type: 'number' })
  staffId: number;
}
export class CreateBillDto {
  @ApiProperty({ type: 'number' })
  tableId: number;
  @ApiProperty({
    type: 'object',
    properties: {
      menuId: { type: 'number' },
      name: { type: 'string' },
      price: { type: 'number' },
      staffId: { type: 'number' },
      staffName: { type: 'string' },
    },
  })
  order: OrderDetailDto;
}

export class IncreaseDto {
  @ApiProperty({ type: 'number' })
  orderId: number;
}
export class BillDto {
  @ApiProperty({ type: 'number' })
  billId: number;
}
export class TableTransformDto {
  @ApiProperty({ type: 'number' })
  fromTableId: number;
  @ApiProperty({ type: 'number' })
  toTableId: number;
}
export class TableSelectedDto {
  @ApiProperty({ type: 'number' })
  tableId: number;
}
export class PayDto {
  @ApiProperty({ type: 'number' })
  billId: number;
  @ApiProperty({ type: 'number' })
  total: number;
  @ApiProperty({ type: 'string' })
  billNote: string;
  @ApiProperty({ type: 'number' })
  staffId: number;
  @ApiProperty({ type: 'string' })
  staffName: string;
}
export class GetBillDto {
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-01-20',
  })
  fromDate: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-12-31',
  })
  toDate: Date;
  @ApiProperty({ type: 'number' })
  staffId: number;
}
