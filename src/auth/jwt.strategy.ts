import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { IUser } from "src/user/entities/user.entity";

export type JwtPayload = IUser & { iat: number; exp: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly _logger: Logger;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.AUTH_JWT_SECRET,
    });
    this._logger = new Logger(JwtStrategy.name);
  }

  validate(payload: JwtPayload) {
    if (!payload.id) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
