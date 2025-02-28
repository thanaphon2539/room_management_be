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
  templateDetailInvoices,
  templateInvoice,
  templateInvoices,
  templateReceipt,
  templateReceipts,
} from "src/pdf-template/template";
import {
  ExpenseItems,
  InvoiceBill,
  ReceiptBill,
  ResponseInvoiceBill,
  ResponseReceiptBill,
} from "./entities/bill.entity";
import { Request, Response } from "express";

@Injectable()
export class BillService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(BillService.name);
  }

  async createInvoiceBill(
    input: CreateBillDto,
    req: Request,
    copy: boolean,
    detail: boolean
  ) {
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
              totalNoVat: value.summary.totalNoVat,
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
              totalNoVat: value.summary.totalNoVat,
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
          customerName: genData.data[0].room?.customerName,
          customerAddress: genData.data[0].room?.customerAddress,
          customerIdTax: genData.data[0].room?.customerIdTax,
          list: genData.data[0].room.list,
        },
        summary: genData.data[0].summary,
      };
      let newObjDetail: any = {};
      if (input.type === typeRoom.legalEntity) {
        const roomDetail: any[] = [];
        const summary = {
          rent: 0,
          service: 0,
          commonFee: 0,
          water: {
            used: 0,
            total: 0,
          },
          electricity: {
            used: 0,
            total: 0,
          },
          otherFee: 0,
          total: 0,
        };
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
                namePrice:
                  el.name.includes("ค่าน้ำ") || el.name.includes("ค่าไฟ")
                    ? el.name
                    : `${el.name}${el.price}`,
              };
            })
          );
          const totalNoVat = parseFloat(
            value.summary.totalNoVat.replace(/,/g, "")
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
          newObj["summary"]["totalNoVat"] += totalNoVat;
          newObj["summary"]["itemNoVat"] += itemNoVat;
          newObj["summary"]["itemVat"] += itemVat;
          newObj["summary"]["vat"] += vat;
          newObj["summary"]["vat3"] += vat3;
          newObj["summary"]["vat5"] += vat5;
          newObj["summary"]["vat7"] += vat7;
          newObj["summary"]["total"] += total;

          // console.log("genData.data >>>", el.room);
          /** detail */
          const rent =
            _.sum(
              value.room.list
                .filter((rent) => rent.type === "N")
                .map((rent) => parseFloat(rent.price.replace(/,/g, "")))
            ) || 0;
          summary.rent += rent;
          const service =
            _.sum(
              value.room.list
                .filter(
                  (service) =>
                    service.type === "*V" && !service.name.includes("ส่วนกลาง")
                )
                .map((service) => parseFloat(service.price.replace(/,/g, "")))
            ) || 0;
          summary.service += service;
          const commonFee =
            _.sum(
              value.room.list
                .filter(
                  (service) =>
                    service.type === "*V" && service.name.includes("ส่วนกลาง")
                )
                .map((service) => parseFloat(service.price.replace(/,/g, "")))
            ) || 0;
          summary.commonFee += commonFee;
          const water = value.room.list.find((water) =>
            water.name.includes("ค่าน้ำ")
          );
          const waterTotal = water?.price
            ? parseFloat(water.price.replace(/,/g, ""))
            : 0;
          summary.water.used += parseFloat(water?.qty.replace(/,/g, "")) || 0;
          summary.water.total += waterTotal;
          const electricity = value.room.list.find((electricity) =>
            electricity.name.includes("ค่าไฟ")
          );
          const electricityTotal = electricity?.price
            ? parseFloat(electricity.price.replace(/,/g, ""))
            : 0;
          summary.electricity.used +=
            parseFloat(electricity?.qty.replace(/,/g, "")) || 0;
          summary.electricity.total += electricityTotal;
          const otherFee =
            _.sum(
              value.room.list
                .filter((other) => other.type === "")
                .map((other) => parseFloat(other.price.replace(/,/g, "")))
            ) || 0;
          summary.otherFee += otherFee;
          summary.total +=
            rent + service + waterTotal + electricityTotal + otherFee;
          roomDetail.push({
            building: value?.nameRoom.slice(0, 1),
            roomNumber: value?.nameRoom.slice(1),
            rent: rent,
            service: service,
            commonFee: commonFee,
            water: {
              befor: water?.unitBefor || 0,
              after: water?.unitAfter || 0,
              used: water?.qty || 0,
              total: waterTotal,
            },
            electricity: {
              befor: electricity?.unitBefor || 0,
              after: electricity?.unitAfter || 0,
              used: electricity?.qty || 0,
              total: electricity?.price
                ? parseFloat(electricity.price.replace(/,/g, ""))
                : 0,
            },
            otherFee: otherFee,
            total: (
              rent +
              service +
              waterTotal +
              electricityTotal +
              otherFee
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
          });
        }
        if (detail) {
          newObjDetail = {
            ...newObj,
            room: roomDetail,
            summary: {
              ...summary,
              total: summary.total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              }),
            },
          };
        }
        console.log("list >>>", list);
        const dataGroupList = _.groupBy(list, "namePrice");
        const newObjList: any[] = [];
        for (const key in dataGroupList) {
          const [data] = dataGroupList[key];
          let unitPrice = dataGroupList[key][0]["price"];
          if (data.name.includes("ค่าน้ำ") || data.name.includes("ค่าไฟ")) {
            unitPrice = data?.unitPrice;
          }
          newObjList.push({
            type: data.type,
            name: data.name,
            qty: _.sum(
              dataGroupList[key].map((el) =>
                parseFloat(el.qty.replace(/,/g, ""))
              )
            ),
            unitPrice: unitPrice,
            price: _.sum(
              dataGroupList[key].map((el) =>
                parseFloat(el.price.replace(/,/g, ""))
              )
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
            sort: data.sort,
          });
        }
        newObj["room"]["list"] = _.orderBy(newObjList, "sort", "asc");
        newObj["summary"]["totalBeforVat"] = (
          newObj["summary"]["totalNoVat"] - newObj["summary"]["itemNoVat"]
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
        // console.log("newObj >>>", newObj.room);
        return this.generateCombinedInvoice(input, req, newObj, newObjDetail);
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
              totalNoVat: value.summary.totalNoVat,
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
              totalNoVat: value.summary.totalNoVat,
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
        id: genData.data[0].id,
        numberBill: genData.numberBill,
        company: genData.company,
        room: {
          nameRoom: _.uniq(genData.data.map((el) => el.room.nameRoom)).join(
            ","
          ),
          customerName: genData.data[0].room?.customerName,
          customerAddress: genData.data[0].room?.customerAddress,
          customerIdTax: genData.data[0].room?.customerIdTax,
          list: genData.data[0].room.list,
        },
        summary: genData.data[0].summary,
      };
      if (input.type === typeRoom.legalEntity) {
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
                namePrice:
                  el.name.includes("ค่าน้ำ") || el.name.includes("ค่าไฟ")
                    ? el.name
                    : `${el.name}${el.price}`,
              };
            })
          );
          const totalNoVat = parseFloat(
            value.summary.totalNoVat.replace(/,/g, "")
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
          newObj["summary"]["totalNoVat"] += totalNoVat;
          newObj["summary"]["itemNoVat"] += itemNoVat;
          newObj["summary"]["itemVat"] += itemVat;
          newObj["summary"]["vat"] += vat;
          newObj["summary"]["vat3"] += vat3;
          newObj["summary"]["vat5"] += vat5;
          newObj["summary"]["vat7"] += vat7;
          newObj["summary"]["total"] += total;
        }
        // console.log("list >>>", list);
        const dataGroupList = _.groupBy(list, "namePrice");
        const newObjList: any[] = [];
        for (const key in dataGroupList) {
          const [data] = dataGroupList[key];
          let unitPrice = dataGroupList[key][0]["price"];
          if (data.name.includes("ค่าน้ำ") || data.name.includes("ค่าไฟ")) {
            unitPrice = data?.unitPrice;
          }
          newObjList.push({
            type: data.type,
            name: data.name,
            qty: _.sum(
              dataGroupList[key].map((el) =>
                parseFloat(el.qty.replace(/,/g, ""))
              )
            ),
            unitPrice: unitPrice,
            price: _.sum(
              dataGroupList[key].map((el) =>
                parseFloat(el.price.replace(/,/g, ""))
              )
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
            sort: data.sort,
          });
        }
        newObj["room"]["list"] = _.orderBy(newObjList, "sort", "asc");
        newObj["summary"]["totalBeforVat"] = (
          newObj["summary"]["totalNoVat"] - newObj["summary"]["itemNoVat"]
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
        // console.log("newObj >>>", newObj);
        return this.generateCombinedReceipt(input, req, newObj);
      } else {
        return this.generateReceipt(input, req, newObj, copy);
      }
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
          serviceOther: true,
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
          nameRoom: result.nameRoom,
          room: result.room,
          summary: result.summary,
          numberBill: result.numberBill,
        });
      }
      return {
        ...newObj,
        data: _.orderBy(newObj["data"], "nameRoom", "asc"),
      };
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
            qty: el.unitAfter - el.unitBefor,
            unitPrice: settingBillUnit?.waterUnit,
            price: settingBillUnit?.waterUnit
              ? (el.unitAfter - el.unitBefor) * settingBillUnit.waterUnit
              : 0,
            unitBefor: el.unitBefor,
            unitAfter: el.unitAfter,
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
              qty: el.unitAfter - el.unitBefor,
              unitPrice: settingBillUnit?.electricityUnit,
              price: settingBillUnit?.electricityUnit
                ? (el.unitAfter - el.unitBefor) *
                  settingBillUnit.electricityUnit
                : 0,
              unitBefor: el.unitBefor,
              unitAfter: el.unitAfter,
            }));
          });
      const list = [
        ...room.rent.map((el) => {
          return {
            ...el,
            type: "N",
            sort: 1,
          };
        }),
        ...transactionWaterUnit.map((el) => {
          return {
            ...el,
            type: "V",
            sort: 2,
          };
        }),
        ...transactionElectricityUnit.map((el) => {
          return {
            ...el,
            type: "V",
            sort: 3,
          };
        }),
        ...room.serviceFee.map((el) => {
          return {
            ...el,
            type: "*V",
            sort: 4,
          };
        }),
        ...room.serviceOther.map((el) => {
          return {
            ...el,
            type: "",
            sort: 5,
          };
        }),
      ];
      const summary = {
        totalNoVat: 0,
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
        /** เผื่อกลับมาใช้ */
        if (input.type === typeRoom.person) {
          if (el?.type === "V" || el?.type === "*V") {
            vat = (el.price * 7) / 100;
            vat7 = (el.price * 7) / 100;
          }
        } else {
          if (el?.type !== "N") {
            vat = (el.price * 7) / 100;
            vat7 = (el.price * 7) / 100;
          }
          if (el?.type === "*V") {
            vat = (el.price * 3) / 100;
            vat3 = (el.price * 3) / 100;
          } else if (el?.type === "N") {
            vat = (el.price * 5) / 100;
            vat5 = (el.price * 5) / 100;
          }
        }
        if (el && el.name) {
          let name = `${el.name} เดือน: ${input.month}/${input.year}`;
          let qty = 1;
          let unitPrice = el.price;
          if (el.name.includes("ค่าน้ำ") || el.name.includes("ค่าไฟ")) {
            name = `${el.name} เดือน: ${monthAgo[1]}/${monthAgo[0]}`;
            qty = el?.qty;
            unitPrice = el?.unitPrice;
          }
          // let type = "N";
          // if (!el.name.includes("ค่าเช่า")) {
          //   type = "V";
          // }
          resultList.push({
            type: el.type,
            name: name,
            unitBefor: el?.unitBefor || 0,
            unitAfter: el?.unitAfter || 0,
            qty: qty.toString(),
            unitPrice: unitPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
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
            sort: el.sort,
          });
          summary.totalNoVat += el.price;
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
        nameRoom: room.nameRoom,
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
          totalNoVat: summary.totalNoVat.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }),
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
      const prefix = copy ? `invoice-copy` : `invoice`;
      const filename = `${prefix}-${
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
      const htmlContent =
        input.type === typeRoom.person
          ? templateReceipt(data, input, userName, copy)
          : templateReceipts(data, input, userName, copy);
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const prefix = copy ? `receipt-copy` : `receipt`;
      const filename = `${prefix}-${
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

  async generateInvoiceDetail(input: CreateBillDto, req: Request, data: any) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      console.log("data >>>", data.room);
      const settingBillUnit = await this.prisma.settingBillUnit.findFirst();
      const htmlContent = templateDetailInvoices(
        data,
        input,
        settingBillUnit?.waterUnit.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }) || "",
        settingBillUnit?.electricityUnit.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }) || ""
      );
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const filename = `invoice-detail-${"customerName"}-${dayjs().format(
        "YYYY-MM-DD-HH-mm"
      )}.pdf`;
      const pdfPath = path.join(__dirname, `../../../public/${filename}`);
      await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
      await browser.close();
      return {
        pdfPath,
        filename,
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

  async generateCombinedInvoice(
    input: CreateBillDto,
    req: Request,
    data: any,
    dataDetail: any
  ) {
    try {
      const userName = req?.user?.name || "admin";
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // console.log("dataDetail >>>", dataDetail);
      const settingBillUnit = await this.prisma.settingBillUnit.findFirst();
      const htmlContent = `
        ${templateInvoices(data, input, userName, false)}
        <div style="page-break-before: always;"></div>
        ${templateInvoices(data, input, userName, true)}
        <div style="page-break-before: always;"></div>
        ${templateDetailInvoices(
          dataDetail,
          input,
          settingBillUnit?.waterUnit.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }) || "",
          settingBillUnit?.electricityUnit.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          }) || ""
        )}
      `;

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const prefix = `invoice`;
      const filename = `${prefix}-${
        data.room.customerName || "customerName"
      }-${dayjs().format("YYYY-MM-DD-HH-mm")}.pdf`;
      const pdfPath = path.join(__dirname, `../../../public/${filename}`);

      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size:14px; text-align:center; width:100%;"></div>`,
        footerTemplate: `<div style="font-size:10px; text-align:center; width:100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
        margin: { top: "50px", bottom: "50px" },
      });

      await browser.close();

      return {
        pdfPath,
        filename,
      };
    } catch (error) {
      this.logger.error("generateCombinedInvoice error >>>", error);
      throw new HttpException(
        { message: error?.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async generateCombinedReceipt(input: CreateBillDto, req: Request, data: any) {
    try {
      const userName = req?.user?.name || "admin";
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const htmlContent = `
        ${templateReceipts(data, input, userName, false)}
        <div style="page-break-before: always;"></div>
        ${templateReceipts(data, input, userName, true)}
      `;

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const prefix = `receipt`;
      const filename = `${prefix}-${
        data.room.customerName || "customerName"
      }-${dayjs().format("YYYY-MM-DD-HH-mm")}.pdf`;
      const pdfPath = path.join(__dirname, `../../../public/${filename}`);

      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size:14px; text-align:center; width:100%;"></div>`,
        footerTemplate: `<div style="font-size:10px; text-align:center; width:100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
        margin: { top: "50px", bottom: "50px" },
      });

      await browser.close();

      return {
        pdfPath,
        filename,
      };
    } catch (error) {
      this.logger.error("generateCombinedReceipt error >>>", error);
      throw new HttpException(
        { message: error?.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
