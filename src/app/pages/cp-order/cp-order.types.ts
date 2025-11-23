import { TClient } from "../client/client.types";
import { TTransport } from "../transport/transport.types";

export type CpProductName = {
    name: string;
    id: string;
};

export type CpOrderItem = {
    batchNo: string;
    productName: CpProductName;
    size: string;
    hsn: string;
    price: string;
    quantity: string;
    code: string;
};

export type TCpOrder = {
    client: TClient | undefined;
    orderId: string;
    orderDate: string;
    items: CpOrderItem[];
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

export type TCpInvoice = {
    orderDetails: TCpOrder;
    id: string;
    orderId: string;
    invoiceNo: string;
    markAsVoid?: boolean;
};
