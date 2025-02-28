import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuard } from '@nestjs/passport';
import { HttpExceptionFilter } from 'src/libs/exceptions/http.exception';
import { HttpInterceptor } from 'src/libs/interceptors/http.interceptor';

@UseGuards(AuthGuard("jwt"))
@Controller("report")
@UseInterceptors(HttpInterceptor)
@UseFilters(HttpExceptionFilter)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
}
