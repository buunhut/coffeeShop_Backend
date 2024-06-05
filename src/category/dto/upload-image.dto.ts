import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ type: 'number' })
  id: number;
  @ApiProperty({ type: 'string', format: 'binary' })
  image?: string;
}
export class DeleteImageDto {
  @ApiProperty({ type: 'number' })
  id: number;
}

