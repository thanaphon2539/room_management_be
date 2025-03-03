import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ReportService } from "./report.service";
import { AuthGuard } from "@nestjs/passport";
import { HttpExceptionFilter } from "src/libs/exceptions/http.exception";
import { HttpInterceptor } from "src/libs/interceptors/http.interceptor";
import { Response } from "express";
import dayjs from "dayjs";

@UseGuards(AuthGuard("jwt"))
@Controller("report")
@UseInterceptors(HttpInterceptor)
@UseFilters(HttpExceptionFilter)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post("rent")
  async generateRentExcel(
    @Res() res: Response,
    @Body()
    input: {
      year: number;
      month: number;
    }
  ) {
    try {
      const excelFile = await this.reportService.generateRentExcel(
        input.year,
        input.month
      );
      const filename =
        "report-rent-" + dayjs().format("YYYY-MM-DD-HH-mm-ss") + ".xlsx";
      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      });
      res.send(excelFile);
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  // @Post("checkin")
  // async generateCheckinExcel(
  //   @Res() res: Response,
  //   @Body()
  //   input: {
  //     year: number;
  //     month: number;
  //   }
  // ) {
  //   try {
  //     const excelFile = await this.reportService.generateCheckinExcel(
  //       input.year,
  //       input.month
  //     );
  //     const filename =
  //       "report-rent-" + dayjs().format("YYYY-MM-DD-HH-mm-ss") + ".xlsx";
  //     res.set({
  //       "Content-Type":
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //       "Content-Disposition": `attachment; filename="${filename}"`,
  //     });
  //     res.send(excelFile);
  //   } catch (error) {
  //     throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  @Post("electricity")
  async generateElectricityExcel(
    @Res() res: Response,
    @Body()
    input: {
      year: number;
      month: number;
    }
  ) {
    try {
      const excelFile = await this.reportService.generateElectricityExcel(
        input.year,
        input.month
      );
      const filename =
        "report-electricity-" + dayjs().format("YYYY-MM-DD-HH-mm-ss") + ".xlsx";
      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      });
      res.send(excelFile);
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("water")
  async generateWaterExcel(
    @Res() res: Response,
    @Body()
    input: {
      year: number;
      month: number;
    }
  ) {
    try {
      const excelFile = await this.reportService.generateWaterExcel(
        input.year,
        input.month
      );
      const filename =
        "report-water-" + dayjs().format("YYYY-MM-DD-HH-mm-ss") + ".xlsx";
      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      });
      res.send(excelFile);
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
