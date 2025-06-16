import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseFilters,
  UseInterceptors,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { RoomService } from "./room.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import {
  UpdateRoomDto,
  UpdateRoomWaterUnitAndElectricityUnitDto,
} from "./dto/update-room.dto";
import { HttpExceptionFilter } from "src/libs/exceptions/http.exception";
import { HttpInterceptor } from "src/libs/interceptors/http.interceptor";
import { AuthGuard } from "@nestjs/passport";
import {
  FilterRoomDto,
  FilterRoomWaterUnitAndElectricityUnitDto,
} from "./dto/filter-room.dto";
import { typeRoomWaterAndElectricity } from "@prisma/client";

@UseGuards(AuthGuard("jwt"))
@Controller("room")
@UseInterceptors(HttpInterceptor)
@UseFilters(HttpExceptionFilter)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post("create")
  createRoom(@Body() input: CreateRoomDto) {
    return this.roomService.createRoom(input);
  }

  @Get("waterunit")
  findWaterUnit(@Query() input: FilterRoomWaterUnitAndElectricityUnitDto) {
    return this.roomService.findWaterUnit(input);
  }

  @Get("electricityunit")
  findElectricityUnit(
    @Query() input: FilterRoomWaterUnitAndElectricityUnitDto
  ) {
    return this.roomService.findElectricityUnit(input);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() input: FilterRoomDto) {
    return this.roomService.findAll(input);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  findOne(@Param("id") id: string) {
    return this.roomService.findOne(+id);
  }

  @Post("update/waterunit")
  updateWaterUnit(@Body() input: UpdateRoomWaterUnitAndElectricityUnitDto[]) {
    return this.roomService.updateWaterUnitAndElectricityUnit(
      input,
      typeRoomWaterAndElectricity.waterUnit
    );
  }

  @Post("update/electricityunit")
  updateElectricityUnit(
    @Body() input: UpdateRoomWaterUnitAndElectricityUnitDto[]
  ) {
    return this.roomService.updateWaterUnitAndElectricityUnit(
      input,
      typeRoomWaterAndElectricity.electricityUnit
    );
  }

  @Put("update/:id")
  updateRoom(@Param("id") id: string, @Body() input: UpdateRoomDto) {
    return this.roomService.updateRoom(+id, input);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.roomService.remove(+id);
  }

  @Post("seed/blank")
  seedRoomBlank() {
    return this.roomService.seedRoomBlank();
  }
}
