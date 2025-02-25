export class ResponseInvoiceBill {
  numberBill: string;
  company?: SettingAddress;
  data: InvoiceBill[];
}

export class ResponseReceiptBill {
  numberBill: string;
  company?: SettingAddress;
  data: ReceiptBill[];
}

export class InvoiceBill {
  id: number;
  numberBill: string;
  company?: SettingAddress;
  room: Room;
  summary: SummaryItems;
}

export class ReceiptBill {
  id?: number;
  numberBill?: string;
  company?: SettingAddress;
  room: Room;
  summary: SummaryItems;
}

export class SettingAddress {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  idTax?: string;
}

export class Room {
  nameRoom: string;
  customerName?: string;
  customerAddress?: string;
  customerIdTax?: string;
  list: ExpenseItems[];
}

export class ExpenseItems {
  type: string;
  name: string;
  qty?: string;
  unitPrice?: string;
  price: string;
  vat: string;
  vat3: string;
  vat5: string;
  vat7: string;
  total: string;
}

export class SummaryItems {
  itemNoVat: string;
  itemVat: string;
  vat: string;
  vat3: string;
  vat5: string;
  vat7: string;
  total: string;
  totalNoVat?: string;
  totalBeforVat?: string;
}
