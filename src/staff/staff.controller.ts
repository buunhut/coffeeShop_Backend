import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Headers,
  Put,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, DeleteStaffDto } from './dto/create-staff.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Headers('token') token: string) {
    return this.staffService.create(token);
  }

  @Get()
  findAll(@Headers('token') token: string) {
    return this.staffService.findAll(token);
  }

  @Put()
  edit(@Headers('token') token: string, @Body() body: CreateStaffDto) {
    return this.staffService.edit(token, body);
  }

  @Delete()
  delete(@Headers('token') token: string, @Body() body: DeleteStaffDto) {
    return this.staffService.delete(token, body);
  }
}
