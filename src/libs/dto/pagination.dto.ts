import { Transform } from "class-transformer";

export class PageOptionsDto {
  @Transform(({ value }) => Number(value))
  page: number = 1;
  @Transform(({ value }) => Number(value))
  limit: number;
}
