import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { Cron, CronExpression, Interval } from "@nestjs/schedule";
import path from "path";
import fs from "fs";
import dayjs from "dayjs";

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

  /** ทุกๆ 3ชม */
  @Interval(3 * 60 * 60 * 1000)
  handleInterval() {
    console.log("This task runs every 3 hours");
    /** test path */
    const pathFolder = path.resolve(`./public`);
    console.log("pathFolder >>>", pathFolder);
    const filenames = fs.readdirSync(pathFolder);
    // console.log('filenames >>>', filenames);
    if (filenames && filenames.length > 0) {
      for (const file of filenames) {
        const fullPath = `${pathFolder}/${file}`;
        const stat = fs.statSync(fullPath);
        const isOneDayOld = dayjs(stat.ctimeMs).isBefore(
          dayjs().subtract(3, "hour")
        );
        if (isOneDayOld) {
          console.log("delete old file", fullPath);
          fs.unlinkSync(fullPath);
        }
      }
    }
  }
}
