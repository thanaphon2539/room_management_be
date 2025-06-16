import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from "@nestjs/common";
import { Response } from "express";
@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const code = exception.getStatus();
    const status = false;
    const message = exception.getResponse()["message"]
      ? exception.getResponse()["message"]
      : exception.getResponse()
      ? exception.getResponse()
      : "unknown error";
    const { errors } = exception.getResponse() as {
      errors: { field: string; message: string }[];
    };
    let meta = { code, status, message, errors };

    response.status(code).json({
      meta,
    });
  }
}
