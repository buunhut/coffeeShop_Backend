import { ApiProperty } from '@nestjs/swagger';

export class CreateNodejDto {
  @ApiProperty({
    type: Date,
    format: 'date-time',
    example: '2024-01-20T00:00:00Z',
  })
  contactTime: Date;
  @ApiProperty({ type: 'string' })
  yourName: string;
  @ApiProperty({ type: 'string' })
  yourEmail: string;
  @ApiProperty({ type: 'string' })
  textMessage: string;
}
export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image?: string;
}
