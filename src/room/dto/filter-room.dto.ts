import { Transform } from "class-transformer";
import { SearchDto } from "src/libs/dto/search.dto";

export class FilterRoomDto extends SearchDto {
  keyword: string;
}

export class FilterRoomWaterUnitAndElectricityUnitDto {
  @Transform(({ value }) => Number(value))
  month: number;
  @Transform(({ value }) => Number(value))
  year: number;
}