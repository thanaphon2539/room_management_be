import { typeBill, typeRoom } from "@prisma/client";

export class CreateBillDto {
  nameRoom: string;
  type: typeRoom;
  year: number;
  month: number;
  typeBill?: typeBill;
  date: string;
}
