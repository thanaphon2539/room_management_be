import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService implements OnModuleInit {
  private readonly _logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this._logger = new Logger(AppService.name);
  }
  async onModuleInit() {
    try {
      await this.prisma.$queryRaw`SELECT 1`; // ใช้ Raw SQL เช็คการเชื่อมต่อ
      this._logger.log("Database connected successfully");
    } catch (error) {
      this._logger.log("Database connection failed:", error.message);
    }
  }
}
