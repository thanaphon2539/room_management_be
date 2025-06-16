import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseFilters,
  UseInterceptors,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatePasswordDto, UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "@nestjs/passport";
import { HttpExceptionFilter } from "src/libs/exceptions/http.exception";
import { HttpInterceptor } from "src/libs/interceptors/http.interceptor";
import { SearchDto } from "src/libs/dto/search.dto";

@UseGuards(AuthGuard("jwt"))
@Controller("user")
@UseInterceptors(HttpInterceptor)
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create")
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() input: SearchDto) {
    return this.userService.findAll(input);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch("repass/:id")
  updatePassword(
    @Param("id") id: string,
    @Body() updateUserDto: UpdatePasswordDto
  ) {
    return this.userService.updatePassword(+id, updateUserDto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
