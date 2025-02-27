import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Res,
  Req,
  HttpException,
  Logger,
} from "@nestjs/common";
import { BillService } from "./bill.service";
import { CreateBillDto } from "./dto/create-bill.dto";
import { UpdateBillDto } from "./dto/update-bill.dto";
import { FilterBillDto } from "./dto/filter-bill.dto";
import { AuthGuard } from "@nestjs/passport";
import { HttpExceptionFilter } from "src/libs/exceptions/http.exception";
import { HttpInterceptor } from "src/libs/interceptors/http.interceptor";
import fs from "fs";
import { Response, Request } from "express";
import dayjs from "dayjs";

@UseGuards(AuthGuard("jwt"))
@Controller("bill")
@UseInterceptors(HttpInterceptor)
@UseFilters(HttpExceptionFilter)
export class BillController {
  private readonly logger: Logger;
  constructor(private readonly billService: BillService) {
    this.logger = new Logger(BillController.name);
  }

  @Post("invoice/test")
  async createInvoiceBillTest(
    @Body() input: CreateBillDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      // const { pdfPath, filename } = await this.billService.generateInvoiceDetail();
      // if (!pdfPath) {
      //   throw new HttpException(
      //     {
      //       message: `ไม่พบข้อมูล pdfpath`,
      //     },
      //     HttpStatus.BAD_REQUEST
      //   );
      // }
      // console.log("filename >>>", filename);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader(
      //   "Content-Disposition",
      //   `attachment; filename=${encodeURIComponent(filename)}`
      // );
      // fs.createReadStream(pdfPath).pipe(res);
    } catch (error) {
      this.logger.error("createInvoiceBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("invoice/copy")
  async createInvoiceBillCopy(
    @Body() input: CreateBillDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const { pdfPath, filename } = await this.billService.createInvoiceBill(
        input,
        req,
        true,
        false
      );
      if (!pdfPath) {
        throw new HttpException(
          {
            message: `ไม่พบข้อมูล pdfpath`,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      console.log("filename >>>", filename);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(filename)}`
      );
      fs.createReadStream(pdfPath).pipe(res);
    } catch (error) {
      this.logger.error("createInvoiceBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("invoice/detail")
  async createInvoiceBillDetail(
    @Body() input: CreateBillDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const { pdfPath, filename } = await this.billService.createInvoiceBill(
        input,
        req,
        true,
        true
      );
      if (!pdfPath) {
        throw new HttpException(
          {
            message: `ไม่พบข้อมูล pdfpath`,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      console.log("filename >>>", filename);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(filename)}`
      );
      fs.createReadStream(pdfPath).pipe(res);
    } catch (error) {
      this.logger.error("createInvoiceBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("invoice")
  async createInvoiceBill(
    @Body() input: CreateBillDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const { pdfPath, filename } = await this.billService.createInvoiceBill(
        input,
        req,
        false,
        true
      );
      if (!pdfPath) {
        throw new HttpException(
          {
            message: `ไม่พบข้อมูล pdfpath`,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      console.log("filename >>>", filename);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(filename)}`
      );
      fs.createReadStream(pdfPath).pipe(res);
    } catch (error) {
      this.logger.error("createInvoiceBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("receipt/copy")
  async createReceiptBillCopy(
    @Body() input: CreateBillDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const { pdfPath, filename } = await this.billService.createReceiptBill(
        input,
        req,
        true
      );
      if (!pdfPath) {
        throw new HttpException(
          {
            message: `ไม่พบข้อมูล pdfpath`,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(filename)}`
      );
      fs.createReadStream(pdfPath).pipe(res);
    } catch (error) {
      this.logger.error("createReceiptBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("receipt")
  async createReceiptBill(
    @Body() input: CreateBillDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const { pdfPath, filename } = await this.billService.createReceiptBill(
        input,
        req,
        false
      );
      if (!pdfPath) {
        throw new HttpException(
          {
            message: `ไม่พบข้อมูล pdfpath`,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(filename)}`
      );
      fs.createReadStream(pdfPath).pipe(res);
    } catch (error) {
      this.logger.error("createReceiptBill error >>>", error);
      throw new HttpException(
        {
          message: error?.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() input: FilterBillDto) {
    return this.billService.findAll(input);
  }
}
