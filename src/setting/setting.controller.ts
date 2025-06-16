import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SettingService } from "./setting.service";
import {
  CreateSettingBillDto,
  CreateSettingContactAddressDto,
} from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { HttpExceptionFilter } from "src/libs/exceptions/http.exception";
import { HttpInterceptor } from "src/libs/interceptors/http.interceptor";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("setting")
@UseInterceptors(HttpInterceptor)
@UseFilters(HttpExceptionFilter)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post("billunit")
  billUnit(@Body() input: CreateSettingBillDto) {
    return this.settingService.createBillUnit(input);
  }

  @Post("contactaddres")
  contactAddress(@Body() input: CreateSettingContactAddressDto) {
    return this.settingService.createContactAddress(input);
  }

  @Get("billunit")
  @HttpCode(HttpStatus.OK)
  findSettingBill() {
    return this.settingService.findSettingBill();
  }

  @Get("contactaddress")
  @HttpCode(HttpStatus.OK)
  findSettingContactAddress() {
    return this.settingService.findSettingContactAddress();
  }
}
