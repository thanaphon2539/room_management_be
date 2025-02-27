import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import {
  UpdateRoomDto,
  UpdateRoomWaterUnitAndElectricityUnitDto,
} from "./dto/update-room.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, typeRoom, typeRoomWaterAndElectricity } from "@prisma/client";
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
      console.log("input >>>", input);
      let response: number[] = [];
      for (const value of input.room) {
        if (!value.nameRoom) {
          throw new HttpException(
            `กรุณากรอกข้อมูลชื่อห้อง`,
            HttpStatus.BAD_REQUEST
          );
        }
        const checkNameRoom = await this.prisma.room.findFirst({
          where: {
            nameRoom: value.nameRoom,
          },
        });
        if (checkNameRoom) {
          throw new HttpException(
            `ไม่สามารถสร้างได้เนื่องจากมีห้องหมายเลขนี้อยู่ในระบบแล้ว`,
            HttpStatus.BAD_REQUEST
          );
        }
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
            let name = false;
            if (input.contact?.name) {
              const checkName = await this.prisma.roomContact.findFirst({
                where: {
                  name: input.contact.name.trim(),
                },
              });
              if (checkName) {
                contactId = checkName.id;
                name = true;
              }
            }
            if (!name) {
              const createdContact = await this.prisma.roomContact.create({
                data: {
                  name: input.contact?.name?.trim(),
                  phone: input.contact?.phone,
                  idCard: input.contact?.idCard,
                  address: input.contact?.address,
                  licensePlate: input.contact?.licensePlate,
                },
              });
              contactId = createdContact.id; // ไม่ error แล้ว
            }
          }
          if (input.company) {
            let name = false;
            if (input.company?.name) {
              const checkName = await this.prisma.roomCompany.findFirst({
                where: {
                  name: input.company.name.trim(),
                },
              });
              if (checkName) {
                companyId = checkName.id;
                name = true;
              }
            }
            if (!name) {
              const createdCompany = await this.prisma.roomCompany.create({
                data: {
                  name: input.company?.name?.trim(),
                  phone: input.company?.phone,
                  idTax: input.company?.idTax,
                  address: input.company?.address,
                },
              });
              companyId = createdCompany.id;
            }
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
        OR: [
          {
            nameRoom: { contains: input.keyword, mode: "insensitive" },
          },
          {
            roomContact: {
              name: { contains: input.keyword, mode: "insensitive" },
            },
          },
          {
            roomCompany: {
              name: { contains: input.keyword, mode: "insensitive" },
            },
          },
        ],
      };
      const count = await this.prisma.room.count({ where: filter });
      const result = await this.prisma.room.findMany({
        where: filter,
        include: {
          roomCompany: true,
          roomContact: true,
          rent: {
            orderBy: {
              id: "asc",
            },
          },
          serviceFee: {
            orderBy: {
              id: "asc",
            },
          },
        },
        orderBy: {
          nameRoom: "asc",
        },
        skip: input.showDataAll
          ? 0
          : input.limit
          ? (input.page - 1) * input.limit
          : 0,
        take: input.limit,
      });
      return wrapMeta(
        result.map((el) => {
          const rentTotal =
            el?.rent?.length > 0 ? _.sum(el.rent.map((rent) => rent.price)) : 0;
          const serviceFeeTotal =
            el?.serviceFee?.length > 0
              ? _.sum(el.serviceFee.map((serviceFee) => serviceFee.price))
              : 0;
          return {
            ...el,
            rentTotal: rentTotal,
            serviceFeeTotal: serviceFeeTotal,
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

  async updateRoom(id: number, input: UpdateRoomDto) {
    try {
      console.log("input >>>", input);
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
      if (input.contact) {
        if (input.contact.id) {
          const checkRoomContact = await this.prisma.roomContact.findFirst({
            where: { id: input.contact.id },
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
                name: input.contact?.name?.trim(),
                phone: input.contact?.phone,
                idCard: input.contact?.idCard,
                address: input.contact?.address,
                updatedAt: dayjs().toDate(),
                licensePlate: input.contact?.licensePlate,
              },
            })
          ).id;
        } else {
          let name = false;
          if (input.contact?.name) {
            const checkName = await this.prisma.roomContact.findFirst({
              where: {
                name: input.contact.name.trim(),
              },
            });
            if (checkName) {
              roomContactId = checkName.id;
              name = true;
            }
          }
          if (!name) {
            roomContactId = (
              await this.prisma.roomContact.create({
                data: {
                  name: input.contact?.name,
                  phone: input.contact?.phone,
                  idCard: input.contact?.idCard,
                  address: input.contact?.address,
                  licensePlate: input.contact?.licensePlate,
                },
              })
            ).id;
          }
        }
      }
      if (input.company) {
        if (input.company.id) {
          const checkRoomCompany = await this.prisma.roomCompany.findFirst({
            where: { id: input.company.id },
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
                name: input.company?.name?.trim(),
                phone: input.company?.phone,
                idTax: input.company?.idTax,
                address: input.company?.address,
                updatedAt: dayjs().toDate(),
              },
            })
          ).id;
        } else {
          let name = false;
          if (input.company?.name) {
            const checkName = await this.prisma.roomCompany.findFirst({
              where: {
                name: input.company.name.trim(),
              },
            });
            if (checkName) {
              roomCompanyId = checkName.id;
              name = true;
            }
          }
          if (!name) {
            roomCompanyId = (
              await this.prisma.roomCompany.create({
                data: {
                  name: input.company?.name,
                  phone: input.company?.phone,
                  idTax: input.company?.idTax,
                  address: input.company?.address,
                },
              })
            ).id;
          }
        }
      }
      if (input.rent.length > 0) {
        const result = checkRoom.rent
          .map((el) => el.id)
          .reduce((acc, x) => {
            if (!input.rent.map((el) => el.id).includes(x)) {
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
        for (const rent of input.rent) {
          if (!rent?.id) {
            await this.prisma.rent.create({
              data: {
                roomId: id,
                name: rent.name,
                price: rent.price,
              },
            });
          } else {
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
      }
      if (input.serviceFee.length > 0) {
        const result = checkRoom.serviceFee
          .map((el) => el.id)
          .reduce((acc, x) => {
            if (!input.serviceFee.map((el) => el.id).includes(x)) {
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
        for (const serviceFee of input.serviceFee) {
          if (!serviceFee?.id) {
            await this.prisma.serviceFee.create({
              data: {
                roomId: id,
                name: serviceFee.name,
                price: serviceFee.price,
              },
            });
          } else {
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
      }
      if (input.type !== checkRoom.type) {
        if (checkRoom.roomCompanyId) {
          await this.prisma.roomCompany.delete({
            where: { id: checkRoom.roomCompanyId },
          });
          await this.prisma.room.update({
            where: { id: id },
            data: {
              roomCompanyId: null,
            },
          });
        }
      }
      const result = await this.prisma.room.update({
        where: {
          id: id,
        },
        data: {
          nameRoom: input.nameRoom,
          type: input.type,
          status: input.status,
          dateOfStay: input.dateOfStay
            ? dayjs(input.dateOfStay).toDate()
            : null,
          issueDate: input.issueDate ? dayjs(input.issueDate).toDate() : null,
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
          if (
            room.unitAfter < room.unitBefor &&
            room.unitBefor !== 0 &&
            room.unitAfter !== 0
          ) {
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
      const dateFilterBefor = dayjs(
        `${input.year}-${input.month < 9 ? "0" + input.month : input.month}`
      )
        .add(-1, "months")
        .format("YYYY-MM")
        .split("-");
      // console.log("dateFilterAfter >>>", dateFilterBefor);
      const result = await this.prisma.room.findMany({
        include: {
          transactionWaterUnit: {
            where: {
              month: { in: [input.month, Number(dateFilterBefor[1])] },
              year: { in: [input.year, Number(dateFilterBefor[0])] },
            },
            orderBy: [
              {
                month: "desc",
              },
              {
                year: "desc",
              },
            ],
          },
        },
        orderBy: {
          nameRoom: "asc",
        },
      });
      return result.map((el) => {
        let unitBefor = 0;
        let unitAfter = 0;
        if (el.transactionWaterUnit.length === 2) {
          unitBefor = el.transactionWaterUnit[1]?.unitAfter;
          unitAfter = el.transactionWaterUnit[0]?.unitAfter;
        } else {
          unitBefor =
            el.transactionWaterUnit[0] &&
            el.transactionWaterUnit[0]?.month !== input.month
              ? el.transactionWaterUnit[0]?.unitAfter
              : 0;
          unitAfter =
            el.transactionWaterUnit[0] &&
            el.transactionWaterUnit[0]?.month === input.month
              ? el.transactionWaterUnit[0]?.unitAfter
              : 0;
        }
        return {
          id: el.id,
          nameRoom: el.nameRoom,
          status: el.status,
          type: el.type,
          month: input.month,
          year: input.year,
          unitBefor: unitBefor,
          unitAfter: unitAfter,
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findElectricityUnit(input: FilterRoomWaterUnitAndElectricityUnitDto) {
    try {
      const dateFilterBefor = dayjs(
        `${input.year}-${input.month < 9 ? "0" + input.month : input.month}`
      )
        .add(-1, "months")
        .format("YYYY-MM")
        .split("-");
      const result = await this.prisma.room.findMany({
        include: {
          transactionElectricityUnit: {
            where: {
              month: { in: [input.month, Number(dateFilterBefor[1])] },
              year: { in: [input.year, Number(dateFilterBefor[0])] },
            },
            orderBy: [
              {
                month: "desc",
              },
              {
                year: "desc",
              },
            ],
          },
        },
        orderBy: {
          nameRoom: "asc",
        },
      });
      return result.map((el) => {
        let unitBefor = 0;
        let unitAfter = 0;
        if (el.transactionElectricityUnit.length === 2) {
          unitBefor = el.transactionElectricityUnit[1]?.unitAfter;
          unitAfter = el.transactionElectricityUnit[0]?.unitAfter;
        } else {
          unitBefor =
            el.transactionElectricityUnit[0] &&
            el.transactionElectricityUnit[0]?.month !== input.month
              ? el.transactionElectricityUnit[0]?.unitAfter
              : 0;
          unitAfter =
            el.transactionElectricityUnit[0] &&
            el.transactionElectricityUnit[0]?.month === input.month
              ? el.transactionElectricityUnit[0]?.unitAfter
              : 0;
        }
        return {
          id: el.id,
          nameRoom: el.nameRoom,
          status: el.status,
          type: el.type,
          month: input.month,
          year: input.year,
          unitBefor: unitBefor,
          unitAfter: unitAfter,
        };
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
