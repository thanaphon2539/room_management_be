import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import {
  CreateSettingBillDto,
  CreateSettingContactAddressDto,
} from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { PrismaService } from "src/prisma/prisma.service";

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
}
