import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { Response } from "express";
import { CountMetaType } from "../meta/wrap-meta";

export interface ResponsePayload<T> {
  meta: {
    code: number;
    status: boolean;
    message: string;
    reqId?: string;
    clientIp?: string;
  };
  data: T;
}
@Injectable()
export class HttpInterceptor<T>
  implements NestInterceptor<T, ResponsePayload<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ResponsePayload<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = response.statusCode < 400 || true;
        const message = response.statusMessage || "Success";
        const code = response.statusCode || 200;

        let returnData: T;
        const meta = { code, status, message };

        if (data instanceof Object && "meta" in data && "data" in data) {
          returnData = (data as CountMetaType<T>).data;
          const metaData = (data as CountMetaType<T>)?.meta;
          if (metaData) {
            Object.assign(meta, metaData);
          }
        } else {
          returnData = data;
        }

        return {
          meta: meta,
          data: returnData,
        };
      })
    );
  }
}
