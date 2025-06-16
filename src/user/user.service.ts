import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatePasswordDto, UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { SearchDto } from "src/libs/dto/search.dto";
import { wrapMeta } from "src/libs/meta/wrap-meta";

@Injectable()
export class UserService {
  private readonly logger: Logger;
  private readonly saltRound: number;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(UserService.name);
    this.saltRound = 10;
  }
  async create(createUserDto: CreateUserDto) {
    try {
      return this.prisma.user
        .create({
          data: {
            ...createUserDto,
            password: await bcrypt.hashSync(
              createUserDto.password,
              this.saltRound
            ),
          },
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        .catch((error) => {
          this.logger.error(error);
          throw new HttpException(
            `สร้างข้อมูลไม่สำเร็จ`,
            HttpStatus.BAD_REQUEST
          );
        });
    } catch (error) {
      throw error;
    }
  }

  async findAll(input: SearchDto) {
    try {
      const filter: Prisma.userWhereInput = {
        isDelete: false,
      };
      if (input.keyword) {
        filter.name = { contains: input.keyword, mode: "insensitive" };
      }
      const count = await this.prisma.user.count({ where: filter });
      const result = await this.prisma.user.findMany({
        where: filter,
        skip: input.showDataAll
          ? 0
          : input.limit
          ? (input.page - 1) * input.limit
          : 0,
        take: input.limit,
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return wrapMeta(
        result,
        count,
        input.showDataAll,
        input.page,
        input.limit
      );
    } catch (error) {
      console.log("error >>>", error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      return this.prisma.user
        .findUnique({
          where: { id: id, isDelete: false },
          select: { id: true, name: true, isActive: true },
        })
        .then((res) => {
          if (!res) {
            throw new HttpException(
              {
                message: "ไม่พบข้อมูลผู้ใช้งาน",
              },
              HttpStatus.BAD_REQUEST
            );
          }
          return res;
        })
        .catch((error) => {
          this.logger.error(error);
          throw new HttpException(
            {
              message: "ไม่พบข้อมูลผู้ใช้งาน",
            },
            HttpStatus.BAD_REQUEST
          );
        });
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this.findOne(id);
      return this.prisma.user.update({
        where: { id: id },
        data: { name: updateUserDto.name },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.prisma.user.delete({
        where: { id: id },
      });
      return {
        id: id,
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    try {
      await this.findOne(id);
      return this.prisma.user.update({
        where: { id: id },
        data: {
          password: await bcrypt.hashSync(
            updatePasswordDto.password,
            this.saltRound
          ),
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
