import dayjs from "dayjs";
import { CreateBillDto } from "src/bill/dto/create-bill.dto";
import {
  ExpenseItems,
  ReceiptBill,
  InvoiceBill,
} from "src/bill/entities/bill.entity";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
dayjs.extend(buddhistEra);

export function templateInvoice(
  data: InvoiceBill,
  input: CreateBillDto,
  userName: string,
  copy: boolean
) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template for Backend</title>
  <style lang="scss">
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    .invoice {
      padding: 20px;
      margin: 20px;
    }

    .header {
      text-align: end;
      margin-bottom: 20px;
    }

    .box-info {
      display: flex;
      justify-content: space-between;

      .info {
        margin-bottom: 20px;
      }

      .right {
        text-align: end;
      }

      p {
        margin: 5px 0;
      }
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9em;
      color: #888;
    }

    .table-invoice {
      border-bottom: 1px solid black;

      th {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
      }

      td {
        align-content: start;
      }

      td:nth-child(1),
      td:nth-child(2),
      td:nth-child(4),
      td:nth-child(5) {
        text-align: center;
      }

      td:nth-child(6),
      th:nth-child(6) {
        text-align: right;
      }
    }

    .table-invoice-footer {
      td {
        align-content: start;
      }
      td:nth-child(1),
      td:nth-child(2) {
        text-align: left;
      }

      td:nth-child(3) {
        text-align: right;
      }
    }
    .signature {
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="invoice">
    <div class="header">
      <h3>ใบแจ้งหนี้ (Invoice)</h3>
    </div>

    <div class="box-info">
      <div class="info">
        <p><strong>${data.company?.name}</strong></p>
        <p> ${data.company?.address}</p>
        <p>เลขประจำตัวผู้เสียภาษี ${data.company?.idTax}</p>
        <p>โทร. ${data.company?.phone} / อีเมล. ${data.company?.email}</p>
        <p><strong>ลูกค้า(Customer)</strong></p>
        <p>${data.room.customerName}</p>
        <p>${data.room.customerAddress}</p>
        <p>เลขบัตรประชาชน: ${data.room.customerIdTax}</p>
      </div>
      <div class="info right">
        <p><strong>${
          copy ? "สำเนา (Transcript)" : "ต้นฉบับ (Original)"
        }</strong></p>
        <p>เลขที่(ID) INV${data.numberBill}</p>
        <p>รอบบิล(Date) ${input.month}/${input.year}</p>
        <p>วันที่ออก(Date) ${
          input.date
            ? dayjs(input.date).format("DD/MM/YYYY")
            : dayjs().format("DD/MM/YYYY")
        }</p>
        <p>ห้อง(Room) ${data.room.nameRoom}</p>
        <p>พนักงาน(Staff) ${userName}</p>
      </div>
    </div>

    <table class="table-invoice" width="100%" cellspacing="0" cellpadding="5">
      <thead>
        <tr>
          <th>ลำดับ(#)</th>
          <th>V/N*</th>
          <th>รายการ (Description)</th>
          <th>จำนวนเงิน (Amount)</th>
          <th>ภาษี (VAT)</th>
          <th>รวมเงิน (Total)</th>
        </tr>
      </thead>
      <tbody>
       ${data.room.list
         .map(
           (item: ExpenseItems, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.type}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.vat}</td>
                <td>${item.total}</td>
            </tr>
              `
         )
         .join("")}
      </tbody>
    </table>
    <table class="table-invoice-footer" width="100%" cellspacing="0" cellpadding="5">
      <tbody>
        <tr>
          <td>* V = ภาษี / N = ยกเว้นภาษี</td>
          <td><strong>มูลค่าสินค้าที่ยกเว้นภาษีมูลค่าเพิ่ม (NON-VAT Items)</strong></td>
          <td>${data.summary.itemNoVat}</td>
        </tr>
        <tr>
          <td>* V = VAT Items / N = NOT-VAT Items</td>
          <td><strong>มูลค่าสินค้าที่เสียภาษีมูลค่าเพิ่ม (VAT Items)</strong></td>
          <td>${data.summary.itemVat}</td>
        </tr>
        <tr>
          <td></td>
          <td><strong>ภาษีมูลค่าเพิ่ม {{vat_amount_percent}} (VAT amount)</strong></td>
          <td>${data.summary.vat}</td>
        </tr>
        <tr>
          <td></td>
          <td style="border-bottom: 1px solid black;"><strong>ยอดเงินสุทธิ (Total Payment Due)</strong></td>
          <td style="border-bottom: 1px solid black;">${data.summary.total}</td>
        </tr>

      </tbody>
    </table>

    <div class="info">
      <p><strong>หมายเหตุ(Note) </strong></p>
    </div>

    <div class="signature">
      <p>ลงชื่อ ......................................... ผู้วางบิล</p>
      <p>(.........................................)</p>
    </div>

    <p><strong>ข้อมูลการชำระเงิน</strong></p>
    <div class="box-info" style="max-width:30%;">
      <div class="info">
        <p>ชื่อธนาคาร </p>
        <p>ชื่อบัญชี </p>
        <p>หมายเลขบัญชี </p>
      </div>
      <div class="info">
        <p> กสิกรไทย</p>
        <p> บจก.พีเอสซี กรุ๊ป</p>
        <p> 124-3-37079-1</p>
      </div>
    </div>
  </div>
</body>

</html>`;
}

export function templateReceipt(
  data: ReceiptBill,
  input: CreateBillDto,
  userName: string,
  copy: boolean
) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template for Backend</title>
  <style lang="scss">
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    .invoice {
      padding: 20px;
      margin: 20px;
    }

    .header {
      text-align: end;
      margin-bottom: 14px;
    }

    .box-info {
      display: flex;
      justify-content: space-between;

      .info {
        margin-bottom: 20px;
      }

      .right {
        text-align: end;
      }

      p {
        margin: 5px 0;
      }
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9em;
      color: #888;
    }

    .table-invoice {
      border-bottom: 1px solid black;

      th {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
      }

      td {
        align-content: start;
      }

      td:nth-child(1),
      td:nth-child(2),
      td:nth-child(4),
      td:nth-child(5) {
        text-align: center;
      }

      td:nth-child(6),
      th:nth-child(6) {
        text-align: right;
      }
    }

    .table-invoice-footer {
      td {
        align-content: start;
      }
      td:nth-child(1),
      td:nth-child(2) {
        text-align: left;
      }

      td:nth-child(3) {
        text-align: right;
      }
    }
    .signature {
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="invoice">
    <div class="header">
      <h3>ใบเสร็จรับเงิน / ใบกำกับภาษี</h3>
      <h3>Receipt / Tax Invoice</h3>
    </div>

    <div class="box-info">
      <div class="info">
        <p><strong>${data.company?.name}</strong></p>
        <p> ${data.company?.address}</p>
        <p>เลขประจำตัวผู้เสียภาษี ${data.company?.idTax}</p>
        <p>โทร. ${data.company?.phone} / อีเมล. ${data.company?.email}</p>
        <p><strong>ลูกค้า(Customer)</strong></p>
        <p>${data.room.customerName}</p>
        <p>${data.room.customerAddress}</p>
        <p>เลขบัตรประชาชน: ${data.room.customerIdTax}</p>
      </div>
      <div class="info right">
        <p><strong>${
          copy ? "สำเนา (Transcript)" : "ต้นฉบับ (Original)"
        }</strong></p>
        <p>เลขที่(ID) RCE${data.numberBill}</p>
        <p>เลขที่(INV) INV${data.numberInv}</p>
        <p>รอบบิล(Date) ${input.month}/${input.year}</p>
        <p>วันที่ออก(Date) ${
          input.date
            ? dayjs(input.date).format("DD/MM/YYYY")
            : dayjs().format("DD/MM/YYYY")
        }</p>
        <p>ห้อง(Room) ${data.room.nameRoom}</p>
        <p>พนักงาน(Staff) ${userName}</p>
      </div>
    </div>

    <table class="table-invoice" width="100%" cellspacing="0" cellpadding="5">
      <thead>
        <tr>
          <th>ลำดับ(#)</th>
          <th>V/N*</th>
          <th>รายการ (Description)</th>
          <th>จำนวนเงิน (Amount)</th>
          <th>ภาษี (VAT)</th>
          <th>รวมเงิน (Total)</th>
        </tr>
      </thead>
      <tbody>
       ${data.room.list
         .map(
           (item: ExpenseItems, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.type}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.vat}</td>
                <td>${item.total}</td>
            </tr>
              `
         )
         .join("")}
      </tbody>
    </table>
    <table class="table-invoice-footer" width="100%" cellspacing="0" cellpadding="5">
      <tbody>
        <tr>
          <td>* V = ภาษี / N = ยกเว้นภาษี</td>
          <td><strong>มูลค่าสินค้าที่ยกเว้นภาษีมูลค่าเพิ่ม (NON-VAT Items)</strong></td>
          <td>${data.summary.itemNoVat}</td>
        </tr>
        <tr>
          <td>* V = VAT Items / N = NOT-VAT Items</td>
          <td><strong>มูลค่าสินค้าที่เสียภาษีมูลค่าเพิ่ม (VAT Items)</strong></td>
          <td>${data.summary.itemVat}</td>
        </tr>
        <tr>
          <td></td>
          <td><strong>ภาษีมูลค่าเพิ่ม {{vat_amount_percent}} (VAT amount)</strong></td>
          <td>${data.summary.vat}</td>
        </tr>
        <tr>
          <td></td>
          <td style="border-bottom: 1px solid black;"><strong>ยอดเงินสุทธิ (Total Payment Due)</strong></td>
          <td style="border-bottom: 1px solid black;">${data.summary.total}</td>
        </tr>

      </tbody>
    </table>

    <div class="info">
      <p><strong>หมายเหตุ(Note) </strong></p>
    </div>

    <div class="signature">
      <p>ลงชื่อ ......................................... ผู้วางบิล</p>
      <p>(.........................................)</p>
    </div>
  </div>
</body>

</html>`;
}

export function templateInvoices(
  data: InvoiceBill,
  input: CreateBillDto,
  userName: string,
  copy: boolean
) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template for Backend</title>
  <style lang="scss">
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    h3 {
      margin: 0px;
    }

    h2 {
      margin-top: 0px;
    }

    p {
      margin: 0px;
    }

    .text-center {
      text-align: center;
    }

    td {
      align-content: start;
      padding: 4px;
    }

    .text-end {
      text-align: end;
    }

    .bg {
      background-color: #c7e1b8;
    }

    .border-l {
      border-left: 2px solid black;
    }

    .border-r {
      border-right: 2px solid black;
    }

    .border-b {
      border-bottom: 2px solid black;
    }

    .border-t {
      border-top: 2px solid black;
    }
  </style>
</head>

<body>
  <div>
    <table class="table-invoice" width="100%" cellspacing="0">
      <tr class="bg">
        <td colspan="6" class="border-t border-l border-r">
          <div>
            <h3>${data.company?.name}</h3>
            <p>${data.company?.address}</p>
            <p>เลขประจำตัวผู้เสียภาษี: ${data.company?.idTax} เบอร์ติดต่อ: ${
    data.company?.phone
  }</p>
          </div>
        </td>
        <td colspan="3" class="border-t border-r">
          <div class="text-center">
            <h2>ใบแจ้งหนี้ (Invoice)</h2>
            <p><strong>${
              copy ? "สำเนา (Transcript)" : "ต้นฉบับ (Original)"
            }</strong></p>
          </div>
        </td>
      </tr>

      <tr>
        <td colspan="6" class="border-t border-l border-r">
          <div>
            <br>
            <p><strong>ชื่อลูกค้า:</strong> ${data.room.customerName}</p>
            <p><strong>ที่อยู่ลูกค้า:</strong> ${
              data.room.customerAddress || "-"
            }</p>
            <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> ${
              data.room.customerIdTax || "-"
            }</p>
          </div>
        </td>
        <td colspan="3" class="border-t border-r">
          <div>
            <br>
            <p><strong>เลขที่:</strong> INV${data.numberBill}</p>
            <p><strong>วันที่:</strong> ${dayjs()
              .locale("th")
              .format("DD/MM/BBBB")}</p>
            <p><strong>เดือน:</strong> ${dayjs(`${input.year}-${input.month}`)
              .locale("th")
              .format("MMMM")} / ${dayjs(`${input.year}-${input.month}`)
    .locale("en")
    .format("MMMM")}</p>
            <p><strong>กำหนดชำระ:</strong>${dayjs(
              `${input.year}-${input.month}`
            )
              .locale("th")
              .format("07/MM/BBBB")}</p>
            <br>
          </div>
        </td>
      </tr>

      <tr class="bg text-center">
        <td colspan="1" class="border-t border-l border-r border-t border-b">ลำดับ</td>
        <td colspan="1" class="border-t border-r border-t border-b">V/N*</td>
        <td colspan="4" class="border-t border-r border-t border-b">รายการ</td>
        <td class="border-t border-r border-t border-b">จำนวน</td>
        <td class="border-t border-r border-t border-b">ราคา/หน่วย</td>
        <td class="border-t border-r border-t border-b">รวม</td>
      </tr>

        ${data.room.list
          .map(
            (item: ExpenseItems, index) => `
            <tr>
              <td colspan="1" class="border-l border-r text-center">${
                index + 1
              }</td>
              <td colspan="1" class="border-r text-center">${item.type}</td>
              <td colspan="4" class="border-r">${item.name}</td>
              <td class="border-r text-center">${item.qty}</td>
              <td class="border-r text-center">${item.unitPrice}</td>
              <td class="border-r text-end">${item.price}</td>
            </tr>
                      `
          )
          .join("")}

      <tr height="20px">
        <td colspan="1" class="border-l border-r"/>
        <td colspan="1" class="border-r"/>
        <td colspan="4" class="border-r"/>
        <td class="border-r"/>
        <td class="border-r"/>
        <td class="border-r"/>
      </tr>

      <tr>
        <td colspan="6" rowspan="2" class="border-t border-l border-r">* V = ภาษี / N = ยกเว้นภาษี * V = VAT Items / N =
          NOT-VAT Items </td>
        <td colspan="2" class="border-t border-r text-end">รวมเป็นเงิน</td>
        <td colspan="1" class="border-t border-r text-end">${
          data.summary.totalNoVat
        }</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">ยกเว้นภาษี</td>
        <td colspan="1" class="border-r">${data.summary.itemNoVat}</td>
      </tr>

      <tr>
        <td colspan="6" rowspan="5" class="border-l border-r">หมายเหตุ: </td>
        <td colspan="2" class="border-r text-end">จำนวนเงินก่อนภาษี </td>
        <td colspan="1" class="border-r text-end">${
          data.summary.totalBeforVat
        }</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">VAT 7%</td>
        <td colspan="1" class="border-r">${data.summary.vat7}</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r ">ค่าบริการหัก ณ ที่จ่าย 3%</td>
        <td colspan="1" class="border-r">${data.summary.vat3}</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">ค่าเช่าหัก ณ ที่จ่าย 5%</td>
        <td colspan="1" class="border-r">${data.summary.vat5}</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">รวมหัก ณ ที่จ่าย</td>
        <td colspan="1" class="border-r">${(
          parseFloat(data.summary.vat3.replace(/,/g, "")) +
          parseFloat(data.summary.vat5.replace(/,/g, ""))
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}</td>
      </tr>

      <tr>
        <td colspan="6" class="border-l border-r"></td>
        <td colspan="2" class="border-r text-end"><strong>รวมเป็นเงินทั้งสิ้น (Total)</strong></td>
        <td colspan="1" class="border-r text-end"><strong>${
          data.summary.total
        }</strong></td>
      </tr>

      <tr>
        <td colspan="3" class="border-r border-l border-t"><br><strong>ข้อมูลการชำระเงิน</strong></td>
        <td colspan="3" rowspan="3" class="border-r border-t"><br><strong>ผู้รับบิล</strong></td>
        <td colspan="3" rowspan="3" class="border-r border-t"><br><strong>ผู้วางบิลในนาม ${
          data.company?.name
        }</strong>
        </td>
      </tr>

      <tr>
        <td colspan="3" class="border-l border-r">ชื่อธนาคาร: กสิกรไทย</td>
      </tr>

      <tr>
        <td colspan="3" class="border-l border-r">ชื่อบัญชี: บจก.พีเอสซี กรุ๊ป</td>
      </tr>

      <tr>
        <td colspan="3" class="border-l border-r ">หมายเลขบัญชี: 124-3-37079-1</td>
        <td colspan="3" class=" border-r text-end">วันที่: ____________________</td>
        <td colspan="3" class=" border-r text-center" style="height :150px"></td>
      </tr>
      <tr height="20px">
        <td colspan="3" width="33%" class="border-l border-r border-b"/>
        <td colspan="3" width="33%" class=" border-r border-b"/>
        <td colspan="3" width="33%" class=" border-r border-b text-center">วันที่: ${dayjs()
          .locale("th")
          .format("DD/MM/BBBB")}</td>
      </tr>


    </table>
  </div>
</body>

</html>`;
}

export function templateReceipts(
  data: ReceiptBill,
  input: CreateBillDto,
  userName: string,
  copy: boolean
) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template for Backend</title>
  <style lang="scss">
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    h3 {
      margin: 0px;
      font-size: 14px;
    }

    h2 {
      margin-top: 0px;
      font-size: 14px;
    }

    p {
      margin: 0px;
    }

    .text-center {
      text-align: center;
      font-size: 14px;
    }

    td {
      align-content: start;
      padding: 4px;
    }

    .text-end {
      text-align: end;
    }

    .bg {
      background-color: #c7e1b8;
    }

    .border-l {
      border-left: 2px solid black;
    }

    .border-r {
      border-right: 2px solid black;
    }

    .border-b {
      border-bottom: 2px solid black;
    }

    .border-t {
      border-top: 2px solid black;
    }
  </style>
</head>

<body>
  <div>
    <table class="table-invoice" width="100%" cellspacing="0">
      <tr class="bg">
        <td colspan="6" class="border-t border-l border-r">
          <div>
            <h3>${data.company?.name}</h3>
            <p>${data.company?.address}</p>
            <p>เลขประจำตัวผู้เสียภาษี: ${data.company?.idTax} เบอร์ติดต่อ: ${
    data.company?.phone
  }</p>
          </div>
        </td>
        <td colspan="3" class="border-t border-r">
          <div class="text-center">
            <h2>ใบเสร็จรับเงิน / ใบกำกับภาษี</h2>
            <h2>Receipt / Tax Invoice</h2>
            <p><strong>${
              copy ? "สำเนา (Transcript)" : "ต้นฉบับ (Original)"
            }</strong></p>
          </div>
        </td>
      </tr>

      <tr>
        <td colspan="6" class="border-t border-l border-r">
          <div>
            <br>
            <p><strong>ชื่อลูกค้า:</strong> ${data.room.customerName}</p>
            <p><strong>ที่อยู่ลูกค้า:</strong> ${
              data.room.customerAddress || "-"
            }</p>
            <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> ${
              data.room.customerIdTax || "-"
            }</p>
          </div>
        </td>
        <td colspan="3" class="border-t border-r">
          <div>
            <br>
            <p><strong>เลขที่:</strong> REC${data.numberBill}</p>
            <p><strong>เลขที่ (INV):</strong> INV${data.numberInv}</p>
            <p><strong>วันที่:</strong> ${dayjs(input.date)
              .locale("th")
              .format("DD/MM/BBBB")}</p>
            <p><strong>เดือน:</strong> ${dayjs(`${input.year}-${input.month}`)
              .locale("th")
              .format("MMMM")} / ${dayjs(`${input.year}-${input.month}`)
    .locale("en")
    .format("MMMM")}</p>
            <br>
          </div>
        </td>
      </tr>

      <tr class="bg text-center">
        <td colspan="1" class="border-t border-l border-r border-t border-b">ลำดับ</td>
        <td colspan="1" class="border-t border-r border-t border-b">V/N*</td>
        <td colspan="4" class="border-t border-r border-t border-b">รายการ</td>
        <td class="border-t border-r border-t border-b">จำนวน</td>
        <td class="border-t border-r border-t border-b">ราคา/หน่วย</td>
        <td class="border-t border-r border-t border-b">รวม</td>
      </tr>

        ${data.room.list
          .map(
            (item: ExpenseItems, index) => `
            <tr>
              <td colspan="1" class="border-l border-r text-center">${
                index + 1
              }</td>
              <td colspan="1" class="border-r text-center">${item.type}</td>
              <td colspan="4" class="border-r">${item.name}</td>
              <td class="border-r text-center">${item.qty}</td>
              <td class="border-r text-center">${item.unitPrice}</td>
              <td class="border-r text-end">${item.price}</td>
            </tr>
                      `
          )
          .join("")}

      <tr height="20px">
        <td colspan="1" class="border-l border-r"/>
        <td colspan="1" class="border-r"/>
        <td colspan="4" class="border-r"/>
        <td class="border-r"/>
        <td class="border-r"/>
        <td class="border-r"/>
      </tr>

      <tr>
        <td colspan="6" rowspan="2" class="border-t border-l border-r">* V = ภาษี / N = ยกเว้นภาษี * V = VAT Items / N =
          NOT-VAT Items </td>
        <td colspan="2" class="border-t border-r text-end">รวมเป็นเงิน</td>
        <td colspan="1" class="border-t border-r text-end">${
          data.summary.totalNoVat
        }</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">ยกเว้นภาษี</td>
        <td colspan="1" class="border-r">${data.summary.itemNoVat}</td>
      </tr>

      <tr>
        <td colspan="6" rowspan="5" class="border-l border-r">หมายเหตุ: </td>
        <td colspan="2" class="border-r text-end">จำนวนเงินก่อนภาษี </td>
        <td colspan="1" class="border-r text-end">${
          data.summary.totalBeforVat
        }</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">VAT 7%</td>
        <td colspan="1" class="border-r">${data.summary.vat7}</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r ">ค่าบริการหัก ณ ที่จ่าย 3%</td>
        <td colspan="1" class="border-r">${data.summary.vat3}</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">ค่าเช่าหัก ณ ที่จ่าย 5%</td>
        <td colspan="1" class="border-r">${data.summary.vat5}</td>
      </tr>

      <tr class="text-end">
        <td colspan="2" class="border-r">รวมหัก ณ ที่จ่าย</td>
        <td colspan="1" class="border-r">${(
          parseFloat(data.summary.vat3.replace(/,/g, "")) +
          parseFloat(data.summary.vat5.replace(/,/g, ""))
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}</td>
      </tr>

      <tr>
        <td colspan="6" class="border-l border-r"></td>
        <td colspan="2" class="border-r text-end"><strong>รวมเป็นเงินทั้งสิ้น (Total)</strong></td>
        <td colspan="1" class="border-r text-end"><strong>${
          data.summary.total
        }</strong></td>
      </tr>

      <tr>
        <td colspan="3" class="border-r border-l border-t"><br><strong>ข้อมูลการชำระเงิน</strong></td>
        <td colspan="3" rowspan="3" class="border-r border-t"><br><strong>ผู้รับบิล</strong></td>
        <td colspan="3" rowspan="3" class="border-r border-t"><br><strong>ผู้รับเงินในนาม ${
          data.company?.name
        }</strong>
        </td>
      </tr>

      <tr>
        <td colspan="3" class="border-l border-r">ชื่อธนาคาร: กสิกรไทย</td>
      </tr>

      <tr>
        <td colspan="3" class="border-l border-r">ชื่อบัญชี: บจก.พีเอสซี กรุ๊ป</td>
      </tr>

       <tr>
        <td colspan="3" class="border-l border-r ">หมายเลขบัญชี: 124-3-37079-1</td>
        <td colspan="3" class=" border-r text-end">วันที่: ____________________</td>
        <td colspan="3" class=" border-r text-center" style="height :150px"></td>
      </tr>
      <tr height="20px">
        <td colspan="3" width="33%" class="border-l border-r border-b"/>
        <td colspan="3" width="33%" class=" border-r border-b"/>
        <td colspan="3" width="33%" class=" border-r border-b text-center">วันที่: ${dayjs()
          .locale("th")
          .format("DD/MM/BBBB")}</td>
      </tr>


    </table>
  </div>
</body>

</html>`;
}

export function templateDetailInvoices(
  data: any,
  input: CreateBillDto,
  unitPriceWater: string,
  unitPriceElectricity: string
) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template for Backend</title>
  <style lang="scss">
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
      padding: 0 10px;
      font-weight: 300;
    }

    .box-info {
      display: flex;
      justify-content: space-between;

      .info {
        margin-bottom: 20px;
      }

      .flex-1 {
        flex: 1;
      }

      .right {
        text-align: end;
      }

      .center {
        text-align: center;
      }

      p {
        margin: 5px 0;
      }
    }

    .table-bill {
      border-left: 1px solid black;
      border-top: 1px solid black;

      td {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
        text-align: center;
      }
    }

    .table-invoice-detail {
      border-left: 1px solid black;
      border-top: 1px solid black;
      font-size: 12px;

      th {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
        align-content: center;
        background-color: whitesmoke;
        font-weight: 500;
      }

      td {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
        text-align: center;
      }

      td:nth-child(7),
      td:nth-child(8),
      td:nth-child(9),
      td:nth-child(10) {
        background-color: antiquewhite;
      }

      td:nth-child(11),
      td:nth-child(12),
      td:nth-child(13),
      td:nth-child(14) {
        background-color: lightblue;
      }
      .no-bg, .no-bg td {
        background-color: transparent !important;
      }
    }
  </style>
</head>

<body>
  <div>
    <div class="box-info">
      <div class="info center flex-1">
        <strong>
          <p>${data.company?.name}</p>
          <p>สถิติ เดือน ${dayjs(`${input.year}-${input.month}`)
            .locale("th")
            .format("MMMM BBBB")}</p>
          <p>จดหน่วยการใช้น้ำและไฟฟ้า วันที่ ${dayjs(
            `${input.year}-${input.month - 1}-24`
          )
            .locale("th")
            .format("DD/MM/BBBB")}</p>
        </strong>
      </div>
      <div>
        <table class="table-bill" cellspacing="0" cellpadding="5">
          <tbody>
            <tr>
              <td>ค่าไฟฟ้า (Electricity)</td>
              <td>${unitPriceElectricity}</td>
            </tr>
            <tr>
              <td>ค่าน้ำ (Water)</td>
              <td>${unitPriceWater}</td>
            </tr>
          </tbody>
        </table>

        <div class="info right"> (บาท)</div>

      </div>
    </div>

    <table class="table-invoice-detail" width="100%" cellspacing="0" cellpadding="2">
      <thead>
        <tr>
          <th rowspan="2">NO.</th>
          <th rowspan="2">Building</th>
          <th rowspan="2">Room No.</th>
          <th rowspan="2">Rent</th>
          <th rowspan="2">Service</th>
          <th rowspan="2">Common Fee</th>
          <th colspan="4" style="background-color: orange">Electricity ค่าไฟฟ้า</th>
          <th colspan="4" style="background-color: skyblue;">Water ค่าน้ำ</th>
          <th rowspan="2">Other Fees</th>
          <th rowspan="2">Total</th>
        </tr>
        <tr>
          <th style="background-color: antiquewhite;">Meter start</th>
          <th style="background-color: antiquewhite;">Meter to</th>
          <th style="background-color: antiquewhite;">Use:unit</th>
          <th style="background-color: antiquewhite;">Bath</th>

          <th style="background-color: mintcream;">Meter start</th>
          <th style="background-color: mintcream;">Meter to</th>
          <th style="background-color: mintcream;">Use:unit</th>
          <th style="background-color: mintcream;">Bath</th>
        </tr>
      </thead>
      <tbody>
      ${data.room
        .map(
          (item: any, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.building}</td>
              <td>${item.roomNumber}</td>
              <td>${item.rent}</td>
              <td>${item.service}</td>
              <td>${item.commonFee}</td>
              <td>${item.electricity.befor}</td>
              <td>${item.electricity.after}</td>
              <td>${item.electricity.used}</td>
              <td>${item.electricity.total}</td>
              <td>${item.water.befor}</td>
              <td>${item.water.after}</td>
              <td>${item.water.used}</td>
              <td>${item.water.total}</td>
              <td>${item.otherFee}</td>
              <td>${item.total}</td>
            </tr>
             `
        )
        .join("")}
       <tr class="no-bg">
          <td colspan="3">รวม</td>
          <td>${data.summary.rent}</td>
          <td>${data.summary.service}</td>
          <td>${data.summary.commonFee}</td>
          <td></td>
          <td></td>
          <td class="non-bg">${data.summary.electricity.used}</td>
          <td class="non-bg">${data.summary.electricity.total}</td>
          <td class="non-bg"></td>
          <td class="non-bg"></td>
          <td class="non-bg">${data.summary.water.used}</td>
          <td>${data.summary.water.total}</td>
          <td>${data.summary.otherFee}</td>
          <td>${data.summary.total}</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>

</html>`;
}
