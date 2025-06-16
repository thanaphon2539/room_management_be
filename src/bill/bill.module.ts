import { Module } from "@nestjs/common";
import { BillService } from "./bill.service";
import { BillController } from "./bill.controller";
import { SettingService } from "src/setting/setting.service";

@Module({
  controllers: [BillController],
  providers: [BillService, SettingService],
  exports: [BillService],
})
export class BillModule {}
