import { statusRoom, typeRoom } from "@prisma/client";

export class ContactDto {
  name: string;
  phone: string;
  idCard: string;
  address: string;
}

export class CompanyDto {
  name: string;
  phone: string;
  idTax: string;
  address: string;
}

export class RentDto {
  name: string;
  price: number;
}

export class ServiceFeeDto {
  name: string;
  price: number;
}

export class CreateRoomDto {
  nameRoom: string;
  type: typeRoom;
  status: statusRoom;
  dateOfStay: Date;
  issueDate: Date;
  contact: ContactDto;
  company: CompanyDto;
  rent: RentDto[];
  serviceFee: ServiceFeeDto[];
}
