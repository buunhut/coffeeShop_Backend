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
import { BillService } from './bill.service';
import {
  BillDto,
  CreateBillDto,
  GetBillDto,
  IncreaseDto,
  PayDto,
  TableTransformDto,
} from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('bill')
@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post('/create-order')
  create(@Headers('token') token: string, @Body() body: CreateBillDto) {
    return this.billService.create(token, body);
  }

  @Post('/increase-quantity')
  increase(@Headers('token') token: string, @Body() body: IncreaseDto) {
    return this.billService.increase(token, body);
  }
  @Post('/decrease-quantity')
  decrease(@Headers('token') token: string, @Body() body: IncreaseDto) {
    return this.billService.decrease(token, body);
  }
  @Delete('/delete-order-item')
  deleteOrderItem(@Headers('token') token: string, @Body() body: IncreaseDto) {
    return this.billService.deleteOrderItem(token, body);
  }
  @Delete('/delete-bill')
  deleteBill(@Headers('token') token: string, @Body() body: BillDto) {
    return this.billService.deleteBill(token, body);
  }

  @Post('/table-transform')
  tableTransform(
    @Headers('token') token: string,
    @Body() body: TableTransformDto,
  ) {
    return this.billService.tableTransform(token, body);
  }
  @Post('/pay-bill')
  pay(@Headers('token') token: string, @Body() body: PayDto) {
    return this.billService.pay(token, body);
  }

  @Get('/')
  get(@Headers('token') token: string) {
    return this.billService.get(token);
  }
  @Post('/get-bill-by-date')
  getByDate(@Headers('token') token: string, @Body() body: GetBillDto) {
    return this.billService.getByDate(token, body);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.billService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
  //   return this.billService.update(+id, updateBillDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.billService.remove(+id);
  // }
}
