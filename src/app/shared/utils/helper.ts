import jsPDF from 'jspdf';
import {
  Month,
  OrderItem,
  TInvoice,
  TOrder,
  Year,
} from '../../pages/order/order.types';
import { MONTHS, ORDER_CONFIG } from './constant';
import autoTable from 'jspdf-autotable';

export const getDateISOString = () => {
  return new Date().toISOString();
};

export const getCurrentFinancialYear = () => {
  var fiscalyear = '';
  var today = new Date();
  if (today.getMonth() + 1 <= 3) {
    fiscalyear = today.getFullYear() - 1 + '-' + today.getFullYear();
  } else {
    fiscalyear = today.getFullYear() + '-' + (today.getFullYear() + 1);
  }
  return fiscalyear;
};

export const padNumber = (num: number) => {
  return String(num).padStart(3, '0');
};

export const numberToWords = (num: number) => {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
  ];
  const teens = [
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    'Ten',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];
  const places = ['Crore', 'Lakh', 'Thousand', 'Hundred', ''];

  if (num === 0) return 'Zero Rupees Only';

  let words = '';
  let [integerPart, decimalPart] = num.toFixed(2).split('.'); // Extract integer and decimal parts
  let numStr = integerPart.padStart(9, '0'); // Ensure 9-digit string (for correct slicing)

  let crores = parseInt(numStr.slice(0, 2));
  let lakhs = parseInt(numStr.slice(2, 4));
  let thousands = parseInt(numStr.slice(4, 6));
  let hundreds = parseInt(numStr.slice(6, 7));
  let tensOnes = parseInt(numStr.slice(7, 9));

  const getWords = (n: number) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 11];
    return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
  };

  if (crores) words += getWords(crores) + ' Crore ';
  if (lakhs) words += getWords(lakhs) + ' Lakh ';
  if (thousands) words += getWords(thousands) + ' Thousand ';
  if (hundreds) words += getWords(hundreds) + ' Hundred ';
  if (tensOnes) words += (words ? 'and ' : '') + getWords(tensOnes);

  words = words.trim() + ' Rupees';

  // Convert Paise (decimal part)
  let paise = parseInt(decimalPart);
  if (paise > 0) {
    words += ` and ${getWords(paise)} Paise`;
  }

  return words + ' Only';
};

export const groupByMonth = (orders: any, year: number) => {
  return orders.reduce((acc: any, order: any) => {
    const dateObj = new Date(order.orderDate || order.expenseDate || order.paymentDate);
    const orderYear = dateObj.getFullYear();

    // Only include orders from the selected year
    if (orderYear !== year) return acc;

    const month = MONTHS[dateObj.getMonth()];

    acc[month] = acc[month] || [];
    acc[month].push(order);

    return acc;
  }, {});
};

export const getFormattedAddress = (
  street: string | undefined,
  city: string | undefined,
  state: string | undefined
): string => {
  const parts: string[] = [];

  if (street) parts.push(street);
  if (city) {
    if (street) {
      parts.push(', ' + city);
    } else {
      parts.push(city);
    }
  }
  if (state) {
    if (city) {
      parts.push(' - ' + state);
    } else {
      parts.push(state);
    }
  }

  return parts.join('');
};

export const getGeneratefPdf = (
  invoiceData: TInvoice,
  order: TOrder,
  orderDate: string,
  name: 'vedik' | 'cp'
) => {
  const orderConfig = ORDER_CONFIG[name]
  const doc = new jsPDF();
  console.log('orderDate', order.orderDate)
  const cgstLabel = new Date('Sep 22 2025').getTime() > new Date(order.orderDate).getTime() ? 'CGST 6%' : 'CGST 2.5%';
  const sgstLabel = new Date('Sep 22 2025').getTime() > new Date(order.orderDate).getTime() ? 'SGST 6%' : 'SGST 2.5%';
  const igstLabel = new Date('Sep 22 2025').getTime() > new Date(order.orderDate).getTime() ? 'IGST 12%' : 'IGST 5%';
  // Add Company Name
  doc.setFontSize(16);
  doc.setTextColor(orderConfig.textColor);
  doc.text(orderConfig.companyName, 10, 20);
  doc.setTextColor('#000000');
  doc.setFontSize(10);
  doc.text(orderConfig.addressLine1, 10, 25);
  doc.text(orderConfig.addressLine2, 10, 30);
  doc.text(orderConfig.phone, 10, 35);

  // Add Logo (Ensure logo is inside "public/" folder)
  const img = new Image();
  img.src = orderConfig.logo; // Ensure you place the logo in "public/" folder
  doc.addImage(img, 'PNG', 150, 10, 50, 30);

  // Invoice Title
  doc.setFontSize(12);
  doc.text('TAX INVOICE', 105, 50, { align: 'center' });
  // Customer & Invoice Details
  let clientName = '';
  if (order.client?.docName && order.client?.clinicName) {
    clientName =
      'Dr. ' + order.client?.docName + ', ' + order.client?.clinicName;
  } else if (order.client?.clinicName) {
    clientName = order.client?.clinicName;
  } else if (order.client?.docName) {
    clientName = order.client?.docName;
  }
  doc.setFontSize(10);
  doc.text(`Bill To:`, 10, 50, { align: 'left' });
  doc.text(`${clientName}`, 10, 55, {
    align: 'left',
  });
  let address = getFormattedAddress(
    order.client?.address,
    order.client?.city,
    order.client?.state
  );

  doc.text(address, 10, 60, { align: 'left' });
  if (order.client?.phoneNo) {
    doc.text(
      order.client?.phoneNo ? `Ph:- +91 ${order.client?.phoneNo}` : '',
      10,
      65,
      { align: 'left' }
    );
  }
  if (order.client?.gstNo) {
    doc.text(
      order.client?.gstNo ? `GST: ${order.client?.gstNo}` : '',
      10,
      order.client?.phoneNo ? 70 : 65,
      { align: 'left' }
    );
  }

  doc.text(`GST: ${orderConfig.gst}`, 200, 50, {
    align: 'right',
  });
  doc.text(`Invoice No: ${invoiceData.invoiceNo}`, 200, 55, {
    align: 'right',
  });
  doc.text(`Date: ${orderDate}`, 200, 60, {
    align: 'right',
  });
  let totalQty = order.items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );
  let discount: any = null;
  if (order.client?.discount && order.client?.discount?.value) {
    discount = (100 - Number(order.client?.discount?.value)) / 100;
  }

  if (order.items.length < 13) {
    const length = 13 - order.items.length;
    for (let i = 0; i < length; i++) {
      order.items.push({} as OrderItem);
    }
  }
  const bodyData: any = [
    ...order.items.map((item, i) => [
      item.productName?.name ? i + 1 : '',
      item.productName?.name,
      item.productName?.name ? item.hsn : '',
      item.batchNo,
      item.size,
      item.quantity,
      discount && item.productName?.name
        ? (Number(item.price) * discount).toFixed(2)
        : item.productName?.name
          ? Number(item.price).toFixed(2)
          : '',
      item.productName?.name && discount
        ? (Number(item.price) * Number(item.quantity) * discount).toFixed(2)
        : item.productName?.name
          ? (Number(item.price) * Number(item.quantity)).toFixed(2)
          : '',
    ]),
    [
      '',
      {
        content: 'Total',
        styles: { fontStyle: 'bold' },
      },
      '',
      '',
      '',
      {
        content: `${Number(totalQty)}`,
        styles: { fontStyle: 'bold' },
      },
      '',
      {
        content: `${order.amountAfterDiscount}`,
        styles: { fontStyle: 'bold' },
      },
    ],
    [
      {
        content: `Place of Supply: Indore`,
        colSpan: 3,
      },
      {
        content: `Total Box: ${order.totalBox ?? ''}`,
        colSpan: 3,
      },
      {
        content: `Sub Total:`,
        styles: { halign: 'right', fontStyle: 'bold' },
      },
      {
        content: `${order.amountAfterDiscount}`,
        styles: { halign: 'right', fontStyle: 'bold' },
      },
    ],
    [
      {
        content: `Bank Details:`,
        colSpan: 3,
      },
      '',
      '',
      '',
      '',
      '',
    ],
    [
      {
        content: `A/C No.: ${orderConfig.bank.account}`,
        colSpan: 3,
      },
      '',
      '',
      '',
      '',
      '',
    ],
    [
      {
        content: `A/C Name: ${orderConfig.bank.name}`,
        colSpan: 3,
      },
      '',
      '',
      '',
      {
        content: order.amountWithIGST ? '' : cgstLabel,
      },
      {
        content: order.amountWithIGST ? '' : order.amountWithCGST,
        styles: { halign: 'right' },
      },
    ],
    [
      {
        content: `IFSC: ${orderConfig.bank.ifsc}`,
        colSpan: 3,
      },
      '',
      '',
      '',
      {
        content: order.amountWithIGST ? igstLabel : sgstLabel,
      },
      {
        content: order.amountWithIGST
          ? order.amountWithIGST
          : order.amountWithSGST,
        styles: { halign: 'right' },
      },
    ],

    [
      '',
      '',
      '',
      '',
      '',
      '',
      {
        content: `Grand Total (Rs.)`,
        styles: { fontStyle: 'bold', fontSize: 12 },
      },
      {
        content: `${order.grandTotal}`,
        styles: {
          fontSize: 12,
          fontStyle: 'bold',
          halign: 'right',
        },
      },
    ],
    [
      {
        content: `Amount in Words: ${numberToWords(Number(order.grandTotal))}`,
        colSpan: 7,
      },
    ],
  ];
  if (order.roundOff) {
    bodyData.splice(19, 0, [
      '',
      '',
      '',
      '',
      '',
      '',
      {
        content: 'Round OFF',
      },
      {
        content: order.roundOff.toFixed(2),
        styles: { halign: 'right' },
      },
    ]);
  }

  // Table Data
  autoTable(doc, {
    startY: 70,
    head: [
      [
        '#',
        'Item Name',
        { content: 'HSN/SAC', styles: { halign: 'center' } },
        { content: 'Batch No.', styles: { halign: 'center' } },
        'Size',
        { content: 'Qty', styles: { halign: 'right' } },
        { content: 'Price/Unit', styles: { halign: 'right' } },
        { content: 'Amount', styles: { halign: 'right' } },
      ],
    ],
    headStyles: {
      fillColor: name === 'vedik' ? [120, 194, 85] : [49, 167, 215],
    },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },

    body: bodyData,
    didParseCell: function (data) {
      data.table.allRows().length;
      // Apply different styling for a specific row
      const tableLength = data.table.body.length;
      if (
        data.row.index === tableLength - 1 ||
        data.row.index === tableLength - 2 ||
        data.row.index === tableLength - 3 ||
        data.row.index === tableLength - 4 ||
        data.row.index === tableLength - 5 ||
        data.row.index === tableLength - 6 ||
        data.row.index === tableLength - 7
      ) {
        // Targeting the second row (index starts from 0)
        data.cell.styles.fillColor = [255, 255, 255]; // white
        data.cell.styles.textColor = [0, 0, 0]; // Black text
      }
      if (data.row.index === 14 || data.row.index === tableLength - 2) {
        data.cell.styles.fillColor = [182, 181, 184];
        data.cell.styles.textColor = [0, 0, 0]; // Black text
      }
    },
  });

  // Total Amounts
  let finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFont('helvetica', 'bold');
  doc.text(`Transport: ${order.transport?.name ?? ''}`, 15, finalY + 5, {
    align: 'left',
  });
  doc.setFont('helvetica', 'normal');
  autoTable(doc, {
    startY: finalY + 8,

    body: [[{ content: 'Terms & Conditions:', styles: { fontStyle: 'bold' } }]],
    theme: 'plain', // No borders
    tableWidth: 'wrap',
  });

  let finalY1 = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(10);
  doc.text(
    `\u2022 Goods once sold will not be taken back or exchanged.`,
    18,
    finalY1 + 2,
    {
      align: 'left',
    }
  );
  doc.text(
    `\u2022 Bills not paid under due date will attract 24% interest.`,
    18,
    finalY1 + 7,
    {
      align: 'left',
    }
  );
  doc.text(
    `\u2022 All disputes subject to Indore jurisdication only.`,
    18,
    finalY1 + 12,
    {
      align: 'left',
    }
  );
  doc.text(
    `\u2022 Certified that the particulars mention above are true and correct, and the amount mentioned 
    represents the price actually charged.`,
    18,
    finalY1 + 17,
    {
      align: 'left',
    }
  );
  return doc;
};

export const filterOrdersByMonthYear = (
  orders: TOrder[],
  month: Month,
  year: Year
): TOrder[] => {
  return orders.filter((order) => {
    if (!order.orderDate) return false;

    // Convert orderDate to Date object
    const orderDate = new Date(order.orderDate);

    return (
      orderDate.getMonth() + 1 === month.value && // JS months are 0-based
      orderDate.getFullYear() === year.value
    );
  });
};
