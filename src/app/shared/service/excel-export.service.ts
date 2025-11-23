// src/app/services/excel-export.service.ts
import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  async exportToExcel(data: any[], fileName: string): Promise<void> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Define columns with custom headers
    worksheet.columns = [
      { header: 'Order Id', key: 'orderId', width: 15 },
      { header: 'Client Name', key: 'clienName', width: 35 },
      { header: 'Date', key: 'orderDate', width: 20 },
      { header: 'Order Amount', key: 'grandTotal', width: 15 },

      { header: 'Received Amount', key: 'receivedAmount', width: 15 },
    ];

    // Add rows using objects (keys must match `key` above)
    worksheet.addRows(data);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }, // blue background
      };
      cell.alignment = { horizontal: 'center' };
    });

    // Add totals row at bottom
    const totalRow = worksheet.addRow([
      'Total',
      '',
      '',
      data.reduce((sum, r) => sum + (r.markAsVoid ? 0 : r.grandTotal ?? 0), 0),
      '',
    ]);
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD966' }, // yellow background
      };
    });

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}.xlsx`);
  }
}
