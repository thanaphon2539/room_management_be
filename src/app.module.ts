import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { SettingModule } from "./setting/setting.module";
import { RoomModule } from "./room/room.module";
import { AppController } from "./app.controller";
import { BillModule } from "./bill/bill.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    AuthModule,
    SettingModule,
    RoomModule,
    BillModule,
    ReportModule,
  ],
  providers: [AppService],
  exports: [AppService],
  controllers: [AppController],
})
export class AppModule {}
