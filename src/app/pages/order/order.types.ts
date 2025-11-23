import { TClient } from '../client/client.types';
import { TTransport } from '../transport/transport.types';

export type ProductName = {
  name: string;
  id: string;
};

export type OrderItem = {
  batchNo: string;
  productName: ProductName;
  size: string;
  hsn: string;
  price: string;
  quantity: string;
  code: string;
};

export type TOrder = {
  client: TClient | undefined;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  id?: string;
  paidAmount: number;
  totalAmount: string;
  amountAfterDiscount: string;
  amountWithSGST: number;
  amountWithCGST: number;
  amountWithIGST: number;
  transport: TTransport | undefined;
  grandTotal: number;
  roundOff: number;
  totalBox?: number;
  markAsVoid?: boolean;
};

export type TInvoice = {
  orderDetails: TOrder;
  id: string;
  orderId: string;
  invoiceNo: string;
  markAsVoid?: boolean;
};

export type Month = {
  name: string;
  value: number; // 1 = Jan, 2 = Feb, ...
  id: number;
};

export type Year = {
  name: string;
  value: number;
  id: number;
};
