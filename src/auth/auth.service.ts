import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { LoginDto } from "./dto/auth.dto";
import bcrypt from "bcryptjs";
import { IUser } from "src/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  private readonly saltRound: number;
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) {
    this.logger = new Logger(AuthService.name);
  }

  public async validateLogin(input: LoginDto) {
    try {
      if (!input.username || !input.username) {
        throw new HttpException(
          {
            message: "กรุณากรอกข้อมูล username และ password ให้ถูกต้อง",
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const user = await this.prisma.user.findFirst({
        where: {
          username: input.username,
        },
      });
      if (!user) {
        throw new HttpException(
          {
            message: "ไม่พบผู้ใช้งานนี้",
            errors: {
              field: "username",
              description: "Incorrect user",
            },
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const isValidPassword = await bcrypt.compareSync(
        input.password,
        user.password
      );
      if (!isValidPassword) {
        throw new HttpException(
          {
            message: "ข้อมูลผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
            errors: {
              field: "password",
              description: "Incorrect Password",
            },
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const token = this._generateAccessToken({
        id: user.id,
        name: user.name,
      });
      return token;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private _generateAccessToken(payload: IUser) {
    const token = this.jwtService.sign(payload, {
      expiresIn: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
    const accessTokenPayload: JwtPayload = this.jwtService.decode(token);
    const refresgTokenPayload: JwtPayload =
      this.jwtService.decode(refreshToken);
    const exp = accessTokenPayload.exp;
    const accessTokenExpiredAt = new Date(exp * 1000);
    const refreshExp = refresgTokenPayload.exp;
    const refreshTokenExpiredAt = new Date(refreshExp * 1000);
    return {
      accessToken: {
        token: token,
        expiredAt: accessTokenExpiredAt,
      },
      refreshToken: {
        token: refreshToken,
        expiredAt: refreshTokenExpiredAt,
      },
    };
  }
}
