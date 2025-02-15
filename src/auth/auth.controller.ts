import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth.dto";
import { HttpExceptionFilter } from "src/libs/exceptions/http.exception";
import { HttpInterceptor } from "src/libs/interceptors/http.interceptor";

@Controller("auth")
@UseInterceptors(HttpInterceptor)
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public login(@Body() input: LoginDto) {
    return this.authService.validateLogin(input);
  }
}
