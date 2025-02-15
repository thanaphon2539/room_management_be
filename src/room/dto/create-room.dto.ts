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

export class RoomDto {
  nameRoom: string;
  status: statusRoom;
  dateOfStay: Date;
  issueDate: Date;
  rent: RentDto[];
  serviceFee: ServiceFeeDto[];
}

export class CreateRoomDto {
  type: typeRoom;
  contact: ContactDto;
  company: CompanyDto;
  room: RoomDto[];
}
