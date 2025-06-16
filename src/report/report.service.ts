import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import ExcelJS from "exceljs";
import { statusBill, typeBill, typeRoom } from "@prisma/client";
import dayjs from "dayjs";

@Injectable()
export class ReportService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(ReportService.name);
  }

  async generateRentExcel(year: number, month: number) {
    try {
      const data = await this.prisma.transactionBill.findMany({
        where: {
          year: year,
          month: month,
          type: typeBill.invoice,
        },
        include: {
          room: {
            include: {
              roomContact: true,
              roomCompany: true,
            },
          },
        },
      });
      // console.log("data >>>", data);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");

      // Add header row
      worksheet.addRow(["รายงานบิลค่าเช่ารายเดือน"]);
      worksheet.addRow(["กรองข้องมูล", `ปี ${year}`, `เดือน ${month}`]);
      worksheet.addRow([]);
      worksheet.addRow([
        "ลำดับ",
        "ห้อง",
        "ประเภท",
        "ข้อมูลผู้ติดต่อ",
        "ราคา",
        "สถานะ",
      ]);

      // Add data rows
      let i = 1;
      let type = `บุคคล`;
      let itemNoVatTotal = 0;
      for (const value of data) {
        let customer = value.room?.roomContact?.name;
        if (value.room.type === typeRoom.legalEntity) {
          type = `นิติบุคคล`;
          customer = value.room?.roomCompany?.name;
        }
        let status = `รอชำระเงิน`;
        if (value.status === statusBill.succuess) {
          status = `ชำระเงินเรียบร้อย`;
        }
        const itemNoVat = parseFloat(value?.itemNoVat.replace(/,/g, "")) || 0;
        worksheet.addRow([
          i,
          value.room.nameRoom,
          type,
          customer,
          itemNoVat.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          status,
        ]);

        itemNoVatTotal += itemNoVat;
        i++;
      }

      /** รวม */
      worksheet.addRow([
        `รวม`,
        "",
        "",
        "",
        itemNoVatTotal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
        "",
      ]);

      // Set column widths
      worksheet.columns = [
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
      ];

      // Write the Excel file to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generateCheckinExcel(year: number, month: number) {
    try {
      const data = await this.prisma.transactionCheckIn.findMany({
        where: {
          date: {
            gte: dayjs(`${year}-${month}`).startOf("months").toDate(),
            lte: dayjs(`${year}-${month}`).endOf("months").toDate(),
          },
        },
        include: {
          room: {
            include: {
              roomContact: true,
              roomCompany: true,
            },
          },
        },
      });
      // console.log("data >>>", data);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");

      // Add header row
      worksheet.addRow(["รายงานย้ายเข้ารายเดือน"]);
      worksheet.addRow(["กรองข้องมูล", `ปี ${year}`, `เดือน ${month}`]);
      worksheet.addRow([]);
      worksheet.addRow(["ลำดับ", "ห้อง", "ประเภท", "ข้อมูลผู้ติดต่อ"]);

      // Add data rows
      let i = 1;
      let type = `บุคคล`;
      for (const value of data) {
        let customer = value.room?.roomContact?.name;
        if (value.room.type === typeRoom.legalEntity) {
          type = `นิติบุคคล`;
          customer = value.room?.roomCompany?.name;
        }
        worksheet.addRow([i, value.room.nameRoom, type, customer]);
        i++;
      }

      /** รวม */
      worksheet.addRow([`รวม`, `${i - 1} ห้อง`]);

      // Set column widths
      worksheet.columns = [
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
      ];

      // Write the Excel file to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generateCheckoutExcel(year: number, month: number) {
    try {
      const data = await this.prisma.transactionCheckOut.findMany({
        where: {
          date: {
            gte: dayjs(`${year}-${month}`).startOf("months").toDate(),
            lte: dayjs(`${year}-${month}`).endOf("months").toDate(),
          },
        },
        include: {
          room: {
            include: {
              roomContact: true,
              roomCompany: true,
            },
          },
        },
      });
      // console.log("data >>>", data);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");

      // Add header row
      worksheet.addRow(["รายงานย้ายออกรายเดือน"]);
      worksheet.addRow(["กรองข้องมูล", `ปี ${year}`, `เดือน ${month}`]);
      worksheet.addRow([]);
      worksheet.addRow([
        "ลำดับ",
        "ห้อง",
        "ประเภท",
        "ข้อมูลผู้ติดต่อ",
        "วันที่ออก",
      ]);

      // Add data rows
      let i = 1;
      let type = `บุคคล`;
      for (const value of data) {
        let customer = value.room?.roomContact?.name;
        if (value.room.type === typeRoom.legalEntity) {
          type = `นิติบุคคล`;
          customer = value.room?.roomCompany?.name;
        }
        worksheet.addRow([
          i,
          value.room.nameRoom,
          type,
          customer,
          dayjs(value.date).format("DD/MM/YYYY"),
        ]);
        i++;
      }

      /** รวม */
      worksheet.addRow([`รวม`, `${i - 1} ห้อง`]);

      // Set column widths
      worksheet.columns = [
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
      ];

      // Write the Excel file to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generateBlankExcel(year: number, month: number) {
    try {
      const data = await this.prisma.transactionBlank.findMany({
        where: {
          date: {
            gte: dayjs(`${year}-${month}`).startOf("months").toDate(),
            lte: dayjs(`${year}-${month}`).endOf("months").toDate(),
          },
        },
        include: {
          room: {
            include: {
              roomContact: true,
              roomCompany: true,
            },
          },
        },
      });
      // console.log("data >>>", data);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");

      // Add header row
      worksheet.addRow(["รายงานห้องว่างรายเดือน"]);
      worksheet.addRow(["กรองข้องมูล", `ปี ${year}`, `เดือน ${month}`]);
      worksheet.addRow([]);
      worksheet.addRow(["ลำดับ", "ห้อง", "ประเภท", "ข้อมูลผู้ติดต่อ"]);

      // Add data rows
      let i = 1;
      let type = `บุคคล`;
      for (const value of data) {
        let customer = value.room?.roomContact?.name;
        if (value.room.type === typeRoom.legalEntity) {
          type = `นิติบุคคล`;
          customer = value.room?.roomCompany?.name;
        }
        worksheet.addRow([i, value.room.nameRoom, type, customer]);
        i++;
      }

      /** รวม */
      worksheet.addRow([`รวม`, `${i - 1} ห้อง`]);

      // Set column widths
      worksheet.columns = [
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
      ];

      // Write the Excel file to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generateElectricityExcel(year: number, month: number) {
    try {
      const settingBillUnit = await this.prisma.settingBillUnit.findFirst();
      const electricityUnit = settingBillUnit?.electricityUnit || 0;
      const data = await this.prisma.transactionElectricityUnit.findMany({
        where: {
          year: year,
          month: month,
        },
        include: {
          room: {
            include: {
              roomContact: true,
              roomCompany: true,
            },
          },
        },
        orderBy: {
          room: {
            nameRoom: "asc",
          },
        },
      });
      // console.log("data >>>", data);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");

      // Add header row
      worksheet.addRow(["รายงานการใช้ไฟ"]);
      worksheet.addRow(["กรองข้องมูล", `ปี ${year}`, `เดือน ${month}`]);
      worksheet.addRow([]);
      worksheet.addRow([
        "ลำดับ",
        "ห้อง",
        "ประเภท",
        "ข้อมูลผู้ติดต่อ",
        "ก่อนจด",
        "หลังจด",
        "รวม",
        "ราคา",
      ]);

      // Add data rows
      let i = 1;
      let unitBeforTotal = 0;
      let unitAfterTotal = 0;
      let unitTotal = 0;
      let priceTotal = 0;
      for (const value of data) {
        let customer = value.room?.roomContact?.name;
        let type = `บุคคล`;
        if (value.room.type === typeRoom.legalEntity) {
          type = `นิติบุคคล`;
          customer = value.room?.roomCompany?.name;
        }
        worksheet.addRow([
          i,
          value.room.nameRoom,
          type,
          customer,
          value.unitBefor,
          value.unitAfter,
          value.unitAfter - value.unitBefor,
          (value.unitAfter - value.unitBefor) * electricityUnit,
        ]);

        unitBeforTotal += value.unitBefor;
        unitAfterTotal += value.unitAfter;
        unitTotal += value.unitAfter - value.unitBefor;
        priceTotal += (value.unitAfter - value.unitBefor) * electricityUnit;
        i++;
      }

      /** รวม */
      worksheet.addRow([
        `รวม`,
        "",
        "",
        "",
        unitBeforTotal,
        unitAfterTotal,
        unitTotal,
        priceTotal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
      ]);

      // Set column widths
      worksheet.columns = [
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
      ];

      // Write the Excel file to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async generateWaterExcel(year: number, month: number) {
    try {
      const settingBillUnit = await this.prisma.settingBillUnit.findFirst();
      const waterUnit = settingBillUnit?.waterUnit || 0;
      const data = await this.prisma.transactionWaterUnit.findMany({
        where: {
          year: year,
          month: month,
        },
        include: {
          room: {
            include: {
              roomContact: true,
              roomCompany: true,
            },
          },
        },
        orderBy: {
          room: {
            nameRoom: "asc",
          },
        },
      });
      // console.log("data >>>", data);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Sheet");

      // Add header row
      worksheet.addRow(["รายงานการใช้น้ำ"]);
      worksheet.addRow(["กรองข้องมูล", `ปี ${year}`, `เดือน ${month}`]);
      worksheet.addRow([]);
      worksheet.addRow([
        "ลำดับ",
        "ห้อง",
        "ประเภท",
        "ข้อมูลผู้ติดต่อ",
        "ก่อนจด",
        "หลังจด",
        "รวม",
        "ราคา",
      ]);

      // Add data rows
      let i = 1;
      let type = `บุคคล`;
      let unitBeforTotal = 0;
      let unitAfterTotal = 0;
      let unitTotal = 0;
      let priceTotal = 0;
      for (const value of data) {
        let customer = value.room?.roomContact?.name;
        let type = `บุคคล`;
        if (value.room.type === typeRoom.legalEntity) {
          type = `นิติบุคคล`;
          customer = value.room?.roomCompany?.name;
        }
        worksheet.addRow([
          i,
          value.room.nameRoom,
          type,
          customer,
          value.unitBefor,
          value.unitAfter,
          value.unitAfter - value.unitBefor,
          (value.unitAfter - value.unitBefor) * waterUnit,
        ]);

        unitBeforTotal += value.unitBefor;
        unitAfterTotal += value.unitAfter;
        unitTotal += value.unitAfter - value.unitBefor;
        priceTotal += (value.unitAfter - value.unitBefor) * waterUnit;
        i++;
      }

      /** รวม */
      worksheet.addRow([
        `รวม`,
        "",
        "",
        "",
        unitBeforTotal,
        unitAfterTotal,
        unitTotal,
        priceTotal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
      ]);

      // Set column widths
      worksheet.columns = [
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
      ];

      // Write the Excel file to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
