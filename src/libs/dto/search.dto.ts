import { Transform } from "class-transformer";
import { PageOptionsDto } from "./pagination.dto";

export class SearchDto extends PageOptionsDto {
  keyword?: string;
  @Transform(({ value }) => value === "true") // ✅ แปลง "true"/"false" -> true/false
  showDataAll: boolean;
}
