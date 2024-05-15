import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import {
  CheckPhoneDto,
  CreateShopDto,
  ShopLoginDto,
} from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('sign-up')
  create(@Body() body: CreateShopDto) {
    return this.shopsService.create(body);
  }

  @Post('check-phone')
  checkPhone(@Body() body: CheckPhoneDto) {
    return this.shopsService.checkPhone(body);
  }

  @Post('sign-in')
  login(@Body() body: ShopLoginDto) {
    return this.shopsService.login(body);
  }
  @Post('check-role')
  checkRole(@Headers('token') token: string) {
    return this.shopsService.checkRole(token);
  }
}
