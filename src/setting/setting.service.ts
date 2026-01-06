import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import {
  CreateSettingBillDto,
  CreateSettingContactAddressDto,
} from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { PrismaService } from "src/prisma/prisma.service";
import dayjs from "dayjs";

@Injectable()
export class SettingService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(SettingService.name);
  }
  async createBillUnit(input: CreateSettingBillDto) {
    try {
      const result = await this.prisma.settingBillUnit.findFirst();
      if (!result) {
        return this.prisma.settingBillUnit.create({
          data: input,
        });
      }
      return this.prisma.settingBillUnit.update({
        where: { id: result.id },
        data: input,
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`อัพเดทข้อมูลไม่สำเร็จ`, HttpStatus.BAD_REQUEST);
    }
  }

  async createContactAddress(input: CreateSettingContactAddressDto) {
    try {
      const result = await this.prisma.settingContactAddress.findFirst();
      if (!result) {
        return this.prisma.settingContactAddress.create({
          data: input,
        });
      }
      return this.prisma.settingContactAddress.update({
        where: { id: result.id },
        data: input,
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`อัพเดทข้อมูลไม่สำเร็จ`, HttpStatus.BAD_REQUEST);
    }
  }

  findSettingBill() {
    try {
      return this.prisma.settingBillUnit.findFirst();
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`ไม่พบข้อมูล`, HttpStatus.BAD_REQUEST);
    }
  }

  findSettingContactAddress() {
    try {
      return this.prisma.settingContactAddress.findFirst();
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`ไม่พบข้อมูล`, HttpStatus.BAD_REQUEST);
    }
  }

  async runningNumber(
    running_type: number,
    running: string,
    id: number,
    prefix_date: string
  ) {
    try {
      const objRunningNumber = {
        type: running_type,
        date: prefix_date,
        number: Number(running),
      };
      if (!id) {
        await this.prisma.runningNumber.create({
          data: objRunningNumber,
        });
      } else {
        await this.prisma.runningNumber.update({
          where: {
            id: id,
          },
          data: {
            number: Number(running),
          },
        });
      }
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  getRunningNumber(number?: number) {
    let runningNumber = 1;
    if (number) {
      runningNumber = Number(number) + 1;
    }
    return runningNumber.toString();
  }

  zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
      return new Array(width + (/\./.test(number) ? 2 : 1)).join("0") + number;
    }
    return number + ""; // always return a string
  }
}
