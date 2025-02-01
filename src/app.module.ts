import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule],
  providers: [AppService],
  exports: [AppService],
  controllers: [],
})
export class AppModule {}
