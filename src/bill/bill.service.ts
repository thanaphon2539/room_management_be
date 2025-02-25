import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateBillDto } from "./dto/create-bill.dto";
import { UpdateBillDto } from "./dto/update-bill.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { FilterBillDto } from "./dto/filter-bill.dto";
import { room, statusBill, typeBill, typeRoom } from "@prisma/client";
import dayjs from "dayjs";
import _ from "lodash";
import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";
import {
  templateInvoice,
  templateInvoices,
  templateReceipt,
} from "src/pdf-template/template";
import {
  ExpenseItems,
  InvoiceBill,
  ReceiptBill,
  ResponseInvoiceBill,
  ResponseReceiptBill,
} from "./entities/bill.entity";
import { Request, Response } from "express";
import PDFDocument from "pdfkit";

@Injectable()
export class BillService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(BillService.name);
  }

  async createInvoiceBill(input: CreateBillDto, req: Request, copy: boolean) {
    try {
      const genData = await this.genDataPdf({
        ...input,
        typeBill: typeBill.invoice,
      });
      // console.log("data >>>", genData);
      for (const value of genData.data) {
        const check = await this.prisma.transactionBill.findFirst({
          where: {
            roomId: value.id,
            year: input.year,
            month: input.month,
            type: typeBill.invoice,
          },
        });
        if (check) {
          await this.prisma.transactionBill.update({
            where: { id: check.id },
            data: {
              number: value.numberBill,
              roomId: value.id,
              year: input.year,
              month: input.month,
              itemNoVat: value.summary.itemNoVat,
              itemVat: value.summary.itemVat,
              vat3: value.summary.vat3,
              vat5: value.summary.vat5,
              vat7: value.summary.vat7,
              total: value.summary.total,
              status: statusBill.waiting,
              type: typeBill.invoice,
            },
          });
        } else {
          await this.prisma.transactionBill.create({
            data: {
              number: value.numberBill,
              roomId: value.id,
              year: input.year,
              month: input.month,
              itemNoVat: value.summary.itemNoVat,
              itemVat: value.summary.itemVat,
              vat3: value.summary.vat3,
              vat5: value.summary.vat5,
              vat7: value.summary.vat7,
              total: value.summary.total,
              status: statusBill.waiting,
              type: typeBill.invoice,
            },
          });
        }
      }
      const newObj = {
        id: genData.data[0].id,
        numberBill: genData.numberBill,
        company: genData.company,
        room: {
          nameRoom: _.uniq(genData.data.map((el) => el.room.nameRoom)).join(
            ","
          ),
          customerName: genData.data[0].room.customerName,
          customerAddress: genData.data[0].room.customerAddress,
          list: genData.data[0].room.list,
        },
        summary: genData.data[0].summary,
      };
      if (genData.data.length > 1) {
        newObj["id"] = genData.data.map((el) => el.id);
        newObj["summary"] = {
          itemNoVat: 0,
          itemVat: 0,
          vat: 0,
          vat3: 0,
          vat5: 0,
          vat7: 0,
          total: 0,
          totalNoVat: 0,
        };
        let list: any[] = [];
        for (const value of genData.data) {
          list.push(
            ...value.room.list.map((el) => {
              return {
                ...el,
                namePrice: `${el.name}${el.price}`,
              };
            })
          );
          const itemNoVat = parseFloat(
            value.summary.itemNoVat.replace(/,/g, "")
          );
          const itemVat = parseFloat(value.summary.itemVat.replace(/,/g, ""));
          const vat = parseFloat(value.summary.vat.replace(/,/g, ""));
          const vat3 = parseFloat(value.summary.vat3.replace(/,/g, ""));
          const vat5 = parseFloat(value.summary.vat5.replace(/,/g, ""));
          const vat7 = parseFloat(value.summary.vat7.replace(/,/g, ""));
          const total = parseFloat(value.summary.total.replace(/,/g, ""));
          newObj["summary"]["itemNoVat"] += itemNoVat;
          newObj["summary"]["itemVat"] += itemVat;
          newObj["summary"]["vat"] += vat;
          newObj["summary"]["vat3"] += vat3;
          newObj["summary"]["vat5"] += vat5;
          newObj["summary"]["vat7"] += vat7;
          newObj["summary"]["total"] += total;
        }
        const dataGroupList = _.groupBy(list, "namePrice");
        const newObjList: any[] = [];

        for (const key in dataGroupList) {
          const [data] = dataGroupList[key];
          newObj["summary"]["totalNoVat"] += _.sum(
            dataGroupList[key].map((el) =>
              parseFloat(el.price.replace(/,/g, ""))
            )
          );
          newObjList.push({
            type: data.type,
            name: data.name,
            qty: dataGroupList[key].length.toString(),
            unitPrice: dataGroupList[key][0]["price"],
            price: _.sum(
              dataGroupList[key].map((el) =>
                parseFloat(el.price.replace(/,/g, ""))
              )
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
          });
        }
        newObj["room"]["list"] = _.orderBy(newObjList, "type", "asc");
        newObj["summary"]["totalBeforVat"] = (
          newObj["summary"]["totalNoVat"] - newObj["summary"]["itemVat"]
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        });
        newObj["summary"]["itemNoVat"] = newObj["summary"][
          "itemNoVat"
        ].toLocaleString("en-US", {
          minimumFractionDigits: 2,
        });
        newObj["summary"]["itemVat"] = newObj["summary"][
          "itemVat"
        ].toLocaleString("en-US", {
          minimumFractionDigits: 2,
        });
        newObj["summary"]["vat"] = newObj["summary"]["vat"].toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
          }
        );
        newObj["summary"]["vat3"] = newObj["summary"]["vat3"].toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
          }
        );
        newObj["summary"]["vat5"] = newObj["summary"]["vat5"].toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
          }
        );
        newObj["summary"]["vat7"] = newObj["summary"]["vat7"].toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
          }
        );
        newObj["summary"]["total"] = newObj["summary"]["total"].toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
          }
        );
        newObj["summary"]["totalNoVat"] = newObj["summary"][
          "totalNoVat"
        ].toLocaleString("en-US", {
          minimumFractionDigits: 2,
        });
        console.log("newObj >>>", newObj);
        return this.generateInvoice(input, req, newObj, copy);
      } else {
        return this.generateInvoice(input, req, newObj, copy);
      }
    } catch (error) {
      this.logger.error("createInvoiceBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async createReceiptBill(input: CreateBillDto, req: Request, copy: boolean) {
    try {
      const genData = await this.genDataPdf({
        ...input,
        typeBill: typeBill.receipt,
      });
      for (const value of genData.data) {
        const checkINV = await this.prisma.transactionBill.findFirst({
          where: {
            roomId: value.id,
            year: input.year,
            month: input.month,
            type: typeBill.invoice,
          },
        });
        if (checkINV) {
          await this.prisma.transactionBill.update({
            where: {
              id: checkINV.id,
            },
            data: {
              status: statusBill.succuess,
            },
          });
        }
        const checkRC = await this.prisma.transactionBill.findFirst({
          where: {
            roomId: value.id,
            year: input.year,
            month: input.month,
            type: typeBill.receipt,
          },
        });
        if (checkRC) {
          await this.prisma.transactionBill.update({
            where: { id: checkRC.id },
            data: {
              number: value.numberBill,
              roomId: value.id,
              year: input.year,
              month: input.month,
              itemNoVat: value.summary.itemNoVat,
              itemVat: value.summary.itemVat,
              vat3: value.summary.vat3,
              vat5: value.summary.vat5,
              vat7: value.summary.vat7,
              total: value.summary.total,
              status: statusBill.succuess,
              type: typeBill.receipt,
            },
          });
        } else {
          await this.prisma.transactionBill.create({
            data: {
              number: value.numberBill,
              roomId: value.id,
              year: input.year,
              month: input.month,
              itemNoVat: value.summary.itemNoVat,
              itemVat: value.summary.itemVat,
              vat3: value.summary.vat3,
              vat5: value.summary.vat5,
              vat7: value.summary.vat7,
              total: value.summary.total,
              status: statusBill.succuess,
              type: typeBill.receipt,
            },
          });
        }
      }
      const newObj = {
        numberBill: genData.numberBill,
        company: genData.company,
        room: {
          nameRoom: _.uniq(genData.data.map((el) => el.room.nameRoom)).join(
            ","
          ),
          customerName: genData.data[0].room.customerName,
          list: genData.data[0].room.list,
        },
        summary: genData.data[0].summary,
      };
      if (genData.data.length > 1) {
      }
      return this.generateReceipt(input, req, newObj, copy);
    } catch (error) {
      this.logger.error("createReceiptBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll(input: FilterBillDto) {
    try {
      if (input.type === typeRoom.person) {
        const result = await this.prisma.room.findMany({
          where: {
            type: input.type,
            createdAt: {
              lte: dayjs(`${input.year}-${input.month}`)
                .endOf("months")
                .toDate(),
            },
          },
          include: {
            roomContact: true,
          },
          orderBy: {
            nameRoom: "asc",
          },
        });
        return result.map((el) => ({
          id: el.id,
          nameRoom: el.nameRoom,
          status: el.status,
          type: el.type,
          contactName: el?.roomContact?.name,
          companyName: null,
        }));
      } else {
        const result = await this.prisma.room.findMany({
          where: {
            type: input.type,
            createdAt: {
              lte: dayjs(`${input.year}-${input.month}`)
                .endOf("months")
                .toDate(),
            },
            roomCompanyId: { not: null },
          },
          include: {
            roomContact: true,
            roomCompany: true,
          },
          orderBy: {
            nameRoom: "asc",
          },
        });
        const dataGroupBy = _.groupBy(result, "roomCompany.id");
        console.log("dataGroupBy >>>", dataGroupBy);
        const newObj: any = [];
        for (const key in dataGroupBy) {
          const [data] = dataGroupBy[key];
          newObj.push({
            nameRoom: dataGroupBy[key].map((el) => el.nameRoom).join(","),
            type: data.type,
            contactName: data?.roomContact?.name,
            companyName: data?.roomCompany?.name,
          });
        }
        return newObj;
      }
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`ไม่พบข้อมูล`, HttpStatus.BAD_REQUEST);
    }
  }

  async genDataPdf(input: CreateBillDto) {
    try {
      const settingAddress =
        await this.prisma.settingContactAddress.findFirst();
      const settingBillUnit = await this.prisma.settingBillUnit.findFirst();
      /** findbill */
      const countReceipt = await this.prisma.transactionBill.findFirst({
        where: {
          type: input.typeBill,
          year: input.year,
          month: input.month,
        },
        orderBy: {
          number: "desc",
        },
      });

      let numberBill = `${dayjs().format("YYYYMM")}0001`;
      if (countReceipt) {
        numberBill = `${(Number(countReceipt.number) + 1).toString()}`;
      }
      const nameRoom = input.nameRoom.split(",");
      const room = await this.prisma.room.findMany({
        where: {
          nameRoom: {
            in: nameRoom,
          },
        },
        include: {
          roomContact: true,
          roomCompany: true,
          rent: true,
          serviceFee: true,
        },
      });
      if (room.length === 0) {
        throw new HttpException(
          {
            message: `ไม่พบข้อมูลห้อง`,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const newObj: any = {
        numberBill: "",
        company: {},
        data: [],
      };
      for (const value of room) {
        const check = await this.prisma.transactionBill.findFirst({
          where: {
            roomId: value.id,
            year: input.year,
            month: input.month,
            type: input.typeBill,
          },
        });
        if (check) {
          numberBill = check.number;
        }
        const result = await this.dataPersonPdf(
          input,
          value,
          settingAddress,
          settingBillUnit,
          numberBill
        );
        newObj["numberBill"] = result.numberBill;
        newObj["company"] = result.company;
        newObj["data"].push({
          id: result.id,
          room: result.room,
          summary: result.summary,
          numberBill: result.numberBill,
        });
      }
      return newObj;
    } catch (error) {
      this.logger.error("genDataPdf error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async dataPersonPdf(
    input: CreateBillDto,
    room: any,
    settingAddress: any,
    settingBillUnit: any,
    numberBill: string
  ) {
    try {
      /** ค่าน้ำ ค่าไฟ */
      const monthAgo = dayjs(`${input.year}-${input.month}`)
        .add(-1)
        .format("YYYY-MM")
        .split("-");
      const transactionWaterUnit = await this.prisma.transactionWaterUnit
        .findMany({
          where: {
            year: Number(monthAgo[0]),
            month: Number(monthAgo[1]),
            roomId: room.id,
          },
        })
        .then((res) => {
          if (res.length === 0) {
            return [];
          }
          return res.map((el) => ({
            name: `ค่าน้ำ`,
            price: settingBillUnit?.waterUnit
              ? (el.unitAfter - el.unitBefor) * settingBillUnit.waterUnit
              : 0,
          }));
        });
      const transactionElectricityUnit =
        await this.prisma.transactionElectricityUnit
          .findMany({
            where: {
              year: Number(monthAgo[0]),
              month: Number(monthAgo[1]),
              roomId: room.id,
            },
          })
          .then((res) => {
            if (res.length === 0) {
              return [];
            }
            return res.map((el) => ({
              name: `ค่าไฟ`,
              price: settingBillUnit?.electricityUnit
                ? (el.unitAfter - el.unitBefor) *
                  settingBillUnit.electricityUnit
                : 0,
            }));
          });
      const list = [
        ...room.rent.map((el) => {
          return {
            ...el,
            type: "N",
          };
        }),
        ...transactionWaterUnit.map((el) => {
          return {
            ...el,
            type: "V",
          };
        }),
        ...transactionElectricityUnit.map((el) => {
          return {
            ...el,
            type: "V",
          };
        }),
        ...room.serviceFee.map((el) => {
          return {
            ...el,
            type: "*V",
          };
        }),
      ];
      const summary = {
        itemNoVat: 0,
        itemVat: 0,
        vat: 0,
        vat3: 0,
        vat5: 0,
        vat7: 0,
        total: 0,
      };
      const resultList: ExpenseItems[] = [];
      for (const el of list) {
        let vat = 0;
        let vat3 = 0;
        let vat5 = 0;
        let vat7 = 0;
        if (input.type === typeRoom.person) {
          if (el?.type === "V" || el?.type === "*V") {
            vat = (el.price * 7) / 100;
            vat7 = (el.price * 7) / 100;
          }
        } else {
          if (el?.type === "V") {
            vat = (el.price * 7) / 100;
            vat7 = (el.price * 7) / 100;
          } else if (el?.type === "*V") {
            vat = (el.price * 3) / 100;
            vat3 = (el.price * 3) / 100;
          } else if (el?.type === "N") {
            vat = (el.price * 5) / 100;
            vat5 = (el.price * 5) / 100;
          }
        }
        if (el && el.name) {
          const name =
            el.name.includes("ค่าน้ำ") || el.name.includes("ค่าไฟ")
              ? `${el.name} เดือน: ${monthAgo[1]}/${monthAgo[0]}`
              : `${el.name} เดือน: ${input.month}/${input.year}`;
          let type = "N";
          if (!el.name.includes("ค่าเช่า")) {
            type = "V";
          }
          resultList.push({
            type: type,
            name: name,
            price: el.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
            vat: vat.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
            vat3: vat3.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
            vat5: vat5.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
            vat7: vat7.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
            total: (el.price + vat3 + vat5 + vat7).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
          });
          summary.itemNoVat += el.name?.includes("ค่าเช่า") ? el.price : 0;
          summary.itemVat += !el.name?.includes("ค่าเช่า") ? el.price : 0;
          summary.vat += vat;
          summary.vat3 += vat3;
          summary.vat5 += vat5;
          summary.vat7 += vat7;
          summary.total += el.price + vat3 + vat5 + vat7;
        }
      }
      return {
        id: room.id,
        numberBill: numberBill,
        company: {
          name: settingAddress?.name,
          phone: settingAddress?.phone,
          email: settingAddress?.email,
          address: settingAddress?.address,
          company: settingAddress?.company,
          idTax: settingAddress?.idTax,
        },
        room: {
          nameRoom: input.nameRoom,
          customerName:
            input.type === typeRoom.legalEntity && room?.roomCompany?.name
              ? room?.roomCompany?.name
              : room?.roomContact?.name,
          customerAddress:
            input.type === typeRoom.legalEntity && room?.roomCompany?.address
              ? room?.roomCompany?.address
              : room?.roomContact?.address,
          customerIdTax:
            input.type === typeRoom.legalEntity
              ? room?.roomCompany?.idTax
              : room?.roomContact?.idCard,
          list: resultList,
        },
        summary: {
          itemNoVat: summary.itemNoVat.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          itemVat: summary.itemVat.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          vat: summary.vat.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          vat3: summary.vat3.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          vat5: summary.vat5.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          vat7: summary.vat7.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
          total: summary.total.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async generateInvoice(
    input: CreateBillDto,
    req: Request,
    data: InvoiceBill,
    copy: boolean
  ) {
    try {
      const userName = req?.user?.name || "admin";
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const htmlContent =
        input.type === typeRoom.person
          ? templateInvoice(data, input, userName, copy)
          : templateInvoices(data, input, userName, copy);
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const filename = `invoice-${
        data.room.customerName || "customerName"
      }-${dayjs().format("YYYY-MM-DD-HH-mm")}.pdf`;
      const pdfPath = path.join(__dirname, `../../../public/${filename}`);
      await page.pdf({ path: pdfPath, format: "A4", printBackground: true });

      await browser.close();
      return {
        pdfPath,
        filename,
      };
    } catch (error) {
      this.logger.error("generateInvoice error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async generateReceipt(
    input: CreateBillDto,
    req: Request,
    data: ReceiptBill,
    copy: boolean
  ) {
    try {
      const userName = req?.user?.name || "admin";
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const htmlContent = templateReceipt(data, input, userName, copy);
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const filename = `invoice-${
        data.room.customerName || "customerName"
      }-${dayjs().format("YYYY-MM-DD-HH-mm")}.pdf`;
      const pdfPath = path.join(__dirname, `../../../public/${filename}`);
      await page.pdf({ path: pdfPath, format: "A4", printBackground: true });

      await browser.close();
      return {
        pdfPath,
        filename,
      };
    } catch (error) {
      this.logger.error("generateReceipt error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async generateInvoicePdf(res: Response) {
    try {
      const filename = `invoice-${"customerName"}-${dayjs().format(
        "YYYY-MM-DD-HH-mm"
      )}.pdf`;
      const pdfPath = path.join(__dirname, `../../../public/${filename}`);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(pdfPath)}`
      );
      res.setHeader("Content-Type", "application/pdf");
      const doc = new PDFDocument({ size: "A4" });

      // Pipe ไปยัง response stream
      doc.pipe(res);
      // ฟอนต์ไทย (ต้องใช้ฟอนต์ที่รองรับ)
      const fontPath = path.resolve("./font/THSarabunNew.ttf");
      doc.font(fontPath);
      // หัวใบแจ้งหนี้
      doc.fontSize(20).text("ใบแจ้งหนี้ (Invoice)", { align: "right" });
      doc.fontSize(12).text("ต้นฉบับ (Original)", { align: "right" });
      doc.text("เลขที่ (ID) INV2025000003", { align: "right" });
      doc.text("วันที่ (Date) 26/01/2025", { align: "right" });
      doc.text("ห้อง (Room) A109", { align: "right" });
      doc.text("พนักงาน (Staff) เดชทัต เดชนเสน", { align: "right" });
      doc.fontSize(14).text("บริษัท พีเอสจี กรุ๊ป จำกัด");
      doc
        .fontSize(12)
        .text(
          "321 ซอยสุขธรรม 11 หมู่ 6 ถนนขยมจอแจดี ตำบลบางยางพารา อำเภอปฉลาดแดง",
          { width: 400 }
        );
      doc.text("จังหวัดระยอง 21140");
      doc.text("เลขประจำตัวผู้เสียภาษี 021558004191 (สำนักงานใหญ่)");
      doc.text("โทร. 0998248989 / อีเมล dcansion.pscgroup@gmail.com");

      doc.moveDown();

      // doc.moveDown();
      // doc.text("ลูกค้า (Customer): A109");

      // doc.moveDown();

      // // ตารางหัวข้อ
      // doc.rect(50, doc.y, 500, 20).fillAndStroke("#000", "#000");
      // doc.fillColor("#fff").text("ลำดับ (#)", 55, doc.y + 5);
      // doc.text("รายการ (Description)", 100, doc.y);
      // doc.text("จำนวนเงิน (Amount)", 350, doc.y);
      // doc.text("ภาษี (VAT)", 450, doc.y);
      // doc.text("รวมเงิน (Total)", 520, doc.y);
      // doc.fillColor("#000");
      // doc.moveDown(2);

      // // ข้อมูลใบแจ้งหนี้
      // const items = [
      //   {
      //     no: 1,
      //     desc: "ค่าเช่าห้อง (Room rate) A109 เดือน 2/2025",
      //     amount: 2000.0,
      //     vat: 0.0,
      //     total: 2000.0,
      //   },
      //   {
      //     no: 2,
      //     desc: "ค่าน้ำ (Water rate) เดือน 1/2025",
      //     amount: 60.0,
      //     vat: 4.2,
      //     total: 64.2,
      //   },
      //   {
      //     no: 3,
      //     desc: "ค่าไฟฟ้า (Electrical rate) เดือน 1/2025",
      //     amount: 112.0,
      //     vat: 7.84,
      //     total: 119.84,
      //   },
      //   {
      //     no: 4,
      //     desc: "ค่าเฟอร์นิเจอร์ (Furniture rate)",
      //     amount: 1200.0,
      //     vat: 84.0,
      //     total: 1284.0,
      //   },
      //   {
      //     no: 5,
      //     desc: "ค่าธรรมเนียม (Common fee)",
      //     amount: 200.0,
      //     vat: 14.0,
      //     total: 214.0,
      //   },
      // ];

      // items.forEach((item, i) => {
      //   doc.text(item.no, 55, doc.y);
      //   doc.text(item.desc, 100, doc.y, { width: 250 });
      //   doc.text(item.amount.toFixed(2), 350, doc.y);
      //   doc.text(item.vat.toFixed(2), 450, doc.y);
      //   doc.text(item.total.toFixed(2), 520, doc.y);
      //   doc.moveDown();
      // });

      // doc.moveDown();

      // // รวมเงิน
      // doc.text(
      //   "มูลค่าสินค้าที่ไม่รวมภาษีมูลค่าเพิ่ม (NON-VAT Items): 2,000.00",
      //   { align: "right" }
      // );
      // doc.text("มูลค่าสินค้าที่มีภาษีมูลค่าเพิ่ม (VAT Items): 1,572.00", {
      //   align: "right",
      // });
      // doc.text("ภาษีมูลค่าเพิ่ม 7.00% (VAT Amount): 110.04", {
      //   align: "right",
      // });
      // doc.fontSize(14).text("ยอดเงินสุทธิ (Total Payment Due): 3,682.04", {
      //   align: "right",
      //   underline: true,
      // });

      // doc.moveDown(2);

      // // ข้อมูลบัญชีโอนเงิน
      // doc.fontSize(12).text("ข้อมูลการชำระเงิน");
      // doc.text("ชื่อธนาคาร: กสิกรไทย");
      // doc.text("ชื่อบัญชี: บจก. พีเอสจี กรุ๊ป");
      // doc.text("หมายเลขบัญชี: 124-3-37079-1");

      doc.end();

      doc.on("finish", () => {
        res.end();
      });
    } catch (error) {}
  }
}
