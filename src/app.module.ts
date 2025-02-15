import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { SettingModule } from "./setting/setting.module";
import { RoomModule } from "./room/room.module";
import { AppController } from "./app.controller";

@Module({
  imports: [PrismaModule, UserModule, AuthModule, SettingModule, RoomModule],
  providers: [AppService],
  exports: [AppService],
  controllers: [AppController],
})
export class AppModule {}
