import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExtraService } from './service';
import { JwtModule } from '@nestjs/jwt';
import { ShopsController } from './shops/shops.controller';
import { ShopsService } from './shops/shops.service';
import { CategoryService } from './category/category.service';
import { CategoryController } from './category/category.controller';
import { TablesController } from './tables/tables.controller';
import { BillController } from './bill/bill.controller';
import { OderDetailController } from './oder-detail/oder-detail.controller';
import { TablesService } from './tables/tables.service';
import { BillService } from './bill/bill.service';
import { OderDetailService } from './oder-detail/oder-detail.service';
import { MenuItemController } from './menu-item/menu-item.controller';
import { MenuItemService } from './menu-item/menu-item.service';
import { StaffModule } from './staff/staff.module';
import { StaffService } from './staff/staff.service';
import { StaffController } from './staff/staff.controller';
import { GasKhiemModule } from './gas-khiem/gas-khiem.module';
import { GasKhiemController } from './gas-khiem/gas-khiem.controller';
import { GasKhiemService } from './gas-khiem/gas-khiem.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Thay thế bằng secret key của bạn
      signOptions: { expiresIn: '365d' }, // Thời gian hết hạn của token
    }),
  ],
  controllers: [
    AppController,
    ShopsController,
    CategoryController,
    MenuItemController,
    TablesController,
    BillController,
    StaffController,
    OderDetailController,
    GasKhiemController,
  ],
  providers: [
    AppService,
    ShopsService,
    CategoryService,
    MenuItemService,
    TablesService,
    BillService,
    OderDetailService,
    StaffService,
    GasKhiemService,
    ExtraService,
  ],
})
export class AppModule {}
