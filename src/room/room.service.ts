import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import {
  UpdateRoomDto,
  UpdateRoomWaterUnitAndElectricityUnitDto,
} from "./dto/update-room.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, typeRoomWaterAndElectricity } from "@prisma/client";
import {
  FilterRoomDto,
  FilterRoomWaterUnitAndElectricityUnitDto,
} from "./dto/filter-room.dto";
import _ from "lodash";
import dayjs from "dayjs";
import { wrapMeta } from "src/libs/meta/wrap-meta";

@Injectable()
export class RoomService {
  private readonly logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(RoomService.name);
  }
  async createRoom(input: CreateRoomDto) {
    try {
      let response: number[] = [];
      for (const value of input.room) {
        const created: Prisma.roomCreateArgs = {
          data: {
            nameRoom: value.nameRoom,
            type: input.type,
            status: value.status,
            dateOfStay: value?.dateOfStay
              ? dayjs(value.dateOfStay).toDate()
              : null,
            issueDate: value?.issueDate
              ? dayjs(value.issueDate).toDate()
              : null,
            rent:
              value.rent && value.rent.length > 0
                ? {
                    createMany: {
                      data: value.rent,
                    },
                  }
                : undefined,

            serviceFee:
              value.serviceFee && value.serviceFee.length > 0
                ? {
                    createMany: {
                      data: value.serviceFee,
                    },
                  }
                : undefined,
          },
          select: {
            id: true,
          },
        };
        const result = await this.prisma.room.create(created).catch((error) => {
          this.logger.error(error);
          throw new HttpException(
            `สร้างข้อมูลไม่สำเร็จ`,
            HttpStatus.BAD_REQUEST
          );
        });
        if (result) {
          let contactId: number | null = null; // แก้ให้สามารถเป็น null ได้
          let companyId: number | null = null; // แก้ให้สามารถเป็น null ได้
          if (input.contact) {
            const createdContact = await this.prisma.roomContact.create({
              data: {
                name: input.contact.name,
                phone: input.contact.phone,
                idCard: input.contact.idCard,
                address: input.contact.address,
                roomId: result.id, // เชื่อมกับ Room
              },
            });
            contactId = createdContact.id; // ไม่ error แล้ว
          }
          if (input.company) {
            const createdCompany = await this.prisma.roomCompany.create({
              data: {
                name: input.company.name,
                phone: input.company.phone,
                idTax: input.company.idTax,
                address: input.company.address,
                roomId: result.id,
              },
            });
            companyId = createdCompany.id;
          }
          if (contactId || companyId) {
            await this.prisma.room.update({
              where: { id: result.id },
              data: { roomContactId: contactId, roomCompanyId: companyId },
            });
          }
          response.push(result.id);
        }
      }

      return {
        id: response,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(input: FilterRoomDto) {
    try {
      const filter: Prisma.roomWhereInput = {
        nameRoom: { contains: input.keyword, mode: "insensitive" },
      };
      const count = await this.prisma.room.count({ where: filter });
      const result = await this.prisma.room.findMany({
        where: filter,
        include: {
          roomCompany: true,
          roomContact: true,
          rent: true,
          serviceFee: true,
        },
        orderBy: {
          nameRoom: "asc",
        },
        skip: input.showDataAll ? 0 : (input.page - 1) * input.limit,
        take: input.limit,
      });
      return wrapMeta(
        result.map((el) => {
          return {
            ...el,
            rent:
              el?.rent?.length > 0
                ? el.rent.map((rent) => {
                    return {
                      ...rent,
                      total: _.sum(el.rent.map((sum) => sum?.price)),
                    };
                  })
                : [],
            serviceFee:
              el?.serviceFee?.length > 0
                ? el.serviceFee.map((serviceFee) => {
                    return {
                      ...serviceFee,
                      total: _.sum(el.serviceFee.map((sum) => sum?.price)),
                    };
                  })
                : [],
          };
        }),
        count,
        input.showDataAll,
        input.page,
        input.limit
      );
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`ไม่พบข้อมูล`, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.prisma.room.findUnique({
        where: { id },
        include: {
          rent: true,
          serviceFee: true,
          roomContact: true,
          roomCompany: true,
        },
      });
      // console.log("result >>>", result);
      return {
        ...result,
        roomContact: result?.roomContact,
        roomCompany: result?.roomCompany,
        rent: result?.rent,
        serviceFee: result?.serviceFee,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(`ไม่พบข้อมูล`, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRoom(id: number, updateRoomDto: UpdateRoomDto) {
    try {
      const checkRoom = await this.prisma.room.findUnique({
        where: { id },
        include: {
          rent: true,
          serviceFee: true,
        },
      });
      if (!checkRoom) {
        throw new HttpException(
          `ไม่พบข้อมูลห้องที่ต้องการแก้ไข`,
          HttpStatus.BAD_REQUEST
        );
      }
      /** ต้องมีการเพิ่ม function เช็คการจ่ายบิล */
      let roomContactId: any;
      let roomCompanyId: any;
      if (updateRoomDto.contact.id) {
        const checkRoomContact = await this.prisma.roomContact.findFirst({
          where: { id: updateRoomDto.contact.id, roomId: id },
        });
        if (!checkRoomContact) {
          throw new HttpException(
            `ไม่พบข้อมูลผู้ติดต่อที่ต้องการแก้ไข`,
            HttpStatus.BAD_REQUEST
          );
        }
        roomContactId = (
          await this.prisma.roomContact.update({
            where: {
              id: checkRoomContact.id,
            },
            data: {
              name: updateRoomDto.contact.name,
              phone: updateRoomDto.contact.phone,
              idCard: updateRoomDto.contact.idCard,
              address: updateRoomDto.contact.address,
              updatedAt: dayjs().toDate(),
            },
          })
        ).id;
      } else {
        roomContactId = (
          await this.prisma.roomContact.create({
            data: {
              roomId: id,
              name: updateRoomDto.contact.name,
              phone: updateRoomDto.contact.phone,
              idCard: updateRoomDto.contact.idCard,
              address: updateRoomDto.contact.address,
            },
          })
        ).id;
      }
      if (updateRoomDto.company.id) {
        const checkRoomCompany = await this.prisma.roomCompany.findFirst({
          where: { id: updateRoomDto.company.id, roomId: id },
        });
        if (!checkRoomCompany) {
          throw new HttpException(
            `ไม่พบข้อมูลบริษัทที่ต้องการแก้ไข`,
            HttpStatus.BAD_REQUEST
          );
        }
        roomCompanyId = (
          await this.prisma.roomCompany.update({
            where: {
              id: checkRoomCompany.id,
            },
            data: {
              name: updateRoomDto.company.name,
              phone: updateRoomDto.company.phone,
              idTax: updateRoomDto.company.idTax,
              address: updateRoomDto.company.address,
              updatedAt: dayjs().toDate(),
            },
          })
        ).id;
      } else {
        roomCompanyId = (
          await this.prisma.roomCompany.create({
            data: {
              roomId: id,
              name: updateRoomDto.company.name,
              phone: updateRoomDto.company.phone,
              idTax: updateRoomDto.company.idTax,
              address: updateRoomDto.company.address,
              updatedAt: dayjs().toDate(),
            },
          })
        ).id;
      }
      if (updateRoomDto.rent.length > 0) {
        const result = checkRoom.rent
          .map((el) => el.id)
          .reduce((acc, x) => {
            if (!updateRoomDto.rent.map((el) => el.id).includes(x)) {
              acc.push(x);
            }
            return acc;
          }, [] as number[]);
        await this.prisma.rent.deleteMany({
          where: {
            id: { in: result },
            roomId: id,
          },
        });
        for (const rent of updateRoomDto.rent) {
          await this.prisma.rent.update({
            where: {
              id: rent.id,
              roomId: id,
            },
            data: {
              name: rent.name,
              price: rent.price,
            },
          });
        }
      }
      if (updateRoomDto.serviceFee.length > 0) {
        const result = checkRoom.rent
          .map((el) => el.id)
          .reduce((acc, x) => {
            if (!updateRoomDto.serviceFee.map((el) => el.id).includes(x)) {
              acc.push(x);
            }
            return acc;
          }, [] as number[]);
        await this.prisma.serviceFee.deleteMany({
          where: {
            id: { in: result },
            roomId: id,
          },
        });
        for (const serviceFee of updateRoomDto.serviceFee) {
          await this.prisma.serviceFee.update({
            where: {
              id: serviceFee.id,
              roomId: id,
            },
            data: {
              name: serviceFee.name,
              price: serviceFee.price,
            },
          });
        }
      }
      const result = await this.prisma.room.update({
        where: {
          id: id,
        },
        data: {
          nameRoom: updateRoomDto.nameRoom,
          type: updateRoomDto.type,
          status: updateRoomDto.status,
          dateOfStay: updateRoomDto.dateOfStay,
          issueDate: updateRoomDto.issueDate,
          roomContactId: roomContactId,
          roomCompanyId: roomCompanyId,
          updatedAt: dayjs().toDate(),
        },
      });
      return {
        id: result.id,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      /** ต้องมีการเพิ่ม function เช็คการจ่ายบิล */
      await this.prisma.room.delete({
        where: { id: id },
      });
      return {
        id: id,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateWaterUnitAndElectricityUnit(
    input: UpdateRoomWaterUnitAndElectricityUnitDto[],
    type: typeRoomWaterAndElectricity
  ) {
    try {
      if (!input || input.length === 0) {
        throw new HttpException(
          `ไม่พบข้อมูลที่จะทำการอัพเดท`,
          HttpStatus.BAD_REQUEST
        );
      }
      let tbName = "transactionWaterUnit";
      if (type === typeRoomWaterAndElectricity.electricityUnit) {
        tbName = "transactionElectricityUnit";
      }
      // console.log("tbName >>>", tbName);
      for (const room of input) {
        const checkroom = await this.prisma.room.findFirst({
          where: { id: room.roomId },
        });
        if (checkroom) {
          if (room.unitAfter <= room.unitBefor) {
            throw new HttpException(
              `ค่าของเดือนก่อนหน้าห้ามมีค่น้อยกว่าหรือเท่ากับเดือนปัจจุบัน`,
              HttpStatus.BAD_REQUEST
            );
          }
          const check = await this.prisma[tbName].findFirst({
            where: {
              roomId: room.roomId,
              year: room.year,
              month: room.month,
            },
          });
          if (!check) {
            await this.prisma[tbName].create({
              data: room,
            });
          } else {
            await this.prisma[tbName].update({
              where: {
                id: check.id,
              },
              data: room,
            });
          }
        }
      }
      return {
        id: input.map((el) => el.roomId),
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findWaterUnit(input: FilterRoomWaterUnitAndElectricityUnitDto) {
    try {
      const result = await this.prisma.room.findMany({
        include: {
          transactionWaterUnit: {
            where: {
              month: input.month,
              year: input.year,
            },
          },
        },
        orderBy: {
          nameRoom: "asc",
        },
      });
      return result.map((el) => {
        const transactionWaterUnit = el.transactionWaterUnit[0];
        return {
          nameRoom: el.nameRoom,
          status: el.status,
          type: el.type,
          month: transactionWaterUnit ? transactionWaterUnit.month : null,
          year: transactionWaterUnit ? transactionWaterUnit.year : null,
          unitBefor: transactionWaterUnit ? transactionWaterUnit.unitBefor : 0,
          unitAfter: transactionWaterUnit ? transactionWaterUnit.unitAfter : 0,
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findElectricityUnit(input: FilterRoomWaterUnitAndElectricityUnitDto) {
    try {
      const result = await this.prisma.room.findMany({
        include: {
          transactionElectricityUnit: {
            where: {
              month: input.month,
              year: input.year,
            },
          },
        },
        orderBy: {
          nameRoom: "asc",
        },
      });
      return result.map((el) => {
        const transactionElectricityUnit = el.transactionElectricityUnit[0];
        return {
          nameRoom: el.nameRoom,
          status: el.status,
          type: el.type,
          month: transactionElectricityUnit
            ? transactionElectricityUnit.month
            : null,
          year: transactionElectricityUnit
            ? transactionElectricityUnit.year
            : null,
          unitBefor: transactionElectricityUnit
            ? transactionElectricityUnit.unitBefor
            : 0,
          unitAfter: transactionElectricityUnit
            ? transactionElectricityUnit.unitAfter
            : 0,
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
