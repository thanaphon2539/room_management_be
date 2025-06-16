import { Injectable, NestMiddleware } from "@nestjs/common";
import { Response, NextFunction } from "express";
import asyncLocalStorage, { IRequest } from "src/auth/async-local-storage";

@Injectable()
export class HttpRequestMiddleware implements NestMiddleware {
  constructor() {}
  use(req: IRequest, res: Response, next: NextFunction) {
    asyncLocalStorage.run({ request: req }, () => next());
  }
}
