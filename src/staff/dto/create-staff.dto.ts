import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({ type: 'number' })
  staffId: number;
  @ApiProperty({ type: 'string' })
  staffName: string;
  @ApiProperty({ type: 'string' })
  staffPhone: string;
  @ApiProperty({ type: 'string' })
  staffAddress: string;
  @ApiProperty({ type: 'string' })
  staffPosition: string;
}
