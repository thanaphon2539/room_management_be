import { typeRoom } from "@prisma/client";

export class FilterBillDto {
  year: number;
  month: number;
  type: typeRoom;
}
