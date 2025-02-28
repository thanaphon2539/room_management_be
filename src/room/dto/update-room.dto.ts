import { statusRoom, typeRoom } from "@prisma/client";

export class UpdateContactDto {
  id: number;
  name: string;
  phone: string;
  idCard: string;
  address: string;
  licensePlate: string;
}

export class UpdateCompanyDto {
  id: number;
  name: string;
  phone: string;
  idTax: string;
  address: string;
}

export class UpdateRentDto {
  id: number;
  name: string;
  price: number;
}

export class UpdateServiceFeeDto {
  id: number;
  name: string;
  price: number;
}

export class UpdateOtherDto {
  id: number;
  name: string;
  price: number;
}

export class UpdateRoomDto {
  nameRoom: string;
  type: typeRoom;
  status: statusRoom;
  dateOfStay: Date;
  issueDate: Date;
  contact: UpdateContactDto;
  company: UpdateCompanyDto;
  rent: UpdateRentDto[];
  serviceFee: UpdateServiceFeeDto[];
  other: UpdateOtherDto[];
}

export class UpdateRoomWaterUnitAndElectricityUnitDto {
  year: number;
  month: number;
  roomId: number;
  unitBefor: number;
  unitAfter: number;
}
