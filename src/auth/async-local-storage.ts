import { AsyncLocalStorage } from "node:async_hooks";
import { JwtPayload } from "./jwt.strategy";

export interface IRequest extends Request {
  processId: string;
  reqId: string;
  version: string;
  module: string;
  clientIp: string;
  user: JwtPayload;
  apiVersion: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<{
  request: IRequest;
}>();

export default asyncLocalStorage;
