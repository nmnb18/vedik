import { Component, OnInit, ViewChild } from '@angular/core';
import { TClient } from '../client/client.types';
import { TProduct } from '../product/product.type';
import { ProductService } from '../product/product.service';
import { ClientService } from '../client/client.service';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { OrderService } from './order.service';
import { OrderItem, TInvoice, TOrder } from './order.types';
import {
  filterOrdersByMonthYear,
  getGeneratefPdf,
} from '../../shared/utils/helper';
import { TransportService } from '../transport/transport.service';
import { TTransport } from '../transport/transport.types';
import { StockService } from '../stock/stock.service';
import { CommonModule, DatePipe } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { ExcelExportService } from '../../shared/service/excel-export.service';
import { ConfirmationService, MessageService } from 'primeng/api';

type Options = {
  id: string;
  name: string;
};

@Component({
  selector: 'vhb-order',
  imports: [
    DialogModule,
    TableModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    CommonModule,
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
  providers: [DatePipe],
})
export class OrderComponent implements OnInit {
  @ViewChild('dt2') dt2!: Table;
  clients: TClient[] = [];
  clientOptions: Options[] = [];
  productOptions: Options[] = [];
  orderForm!: FormGroup;
  products!: TProduct[];
  orders!: TOrder[];
  visible = false;
  selectedOrder!: TOrder | null;
  selectedProduct: TProduct = {} as TProduct;
  isEdit: boolean = false;
  invoiceData!: TInvoice;
  todaysDate: string = new Date().toDateString();
  transport!: TTransport[];
  transportOptions: Options[] = [];
  inStockMsg: any = {};
  total = 0;
  paidTotal = 0;
  isDownloadModal = false;
  monthOptions = [
    { name: 'Jan', value: 1, id: 1 },
    { name: 'Feb', value: 2, id: 2 },
    { name: 'Mar', value: 3, id: 3 },
    { name: 'Apr', value: 4, id: 4 },
    { name: 'May', value: 5, id: 5 },
    { name: 'Jun', value: 6, id: 6 },
    { name: 'Jul', value: 7, id: 7 },
    { name: 'Aug', value: 8, id: 8 },
    { name: 'Sep', value: 9, id: 9 },
    { name: 'Oct', value: 10, id: 10 },
    { name: 'Nov', value: 11, id: 11 },
    { name: 'Dec', value: 12, id: 12 },
  ];
  yearOptions = [
    { name: '2025', value: 2025, id: 2025 },
    { name: '2026', value: 2026, id: 2026 },
    { name: '2027', value: 2027, id: 2027 },
  ];
  downloadMonth: any;
  downloadYear: any;
  constructor(
    private productSvc: ProductService,
    private clientSvc: ClientService,
    private transportSvc: TransportService,
    private formBuilder: FormBuilder,
    private orderSvc: OrderService,
    private stockSvc: StockService,
    private excelSvc: ExcelExportService,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.getAllProducts();
    this.getAllClients();
    this.getAllTransport();
    this.getAllOrder();
    this.setForm();
  }

  onGlobalFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dt2.filterGlobal(input.value, 'contains');
  }

  // compute total from filtered data
  getFilteredTotal(): number {
    const data = this.dt2?.filteredValue || this.orders; // use filtered list if exists
    const filteredData = data?.filter((item) => !item.markAsVoid);
    return filteredData?.reduce(
      (sum, order) => sum + Number(order.grandTotal || 0),
      0
    );
  }

  getRecievedTotal(): number {
    const data = this.dt2?.filteredValue || this.orders; // use filtered list if exists

    const filteredData = data?.filter((item) => !item.markAsVoid);
    return filteredData?.reduce(
      (sum, order) => sum + Number(order.paidAmount || 0),
      0
    );
  }

  downloadExcel() {
    const currentData = new Date().toISOString();
    const data = this.orders
      .map((item: TOrder) => {
        return {
          orderId: item.orderId,
          clienName: item.client?.clinicName || item.client?.docName,
          orderDate: item.orderDate,
          grandTotal: Number(item.grandTotal),
          receivedAmount: item.paidAmount,
          markAsVoid: item.markAsVoid,
        };
      })
      .sort((a, b) => {
        return (
          new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        );
      }).filter((item) => !item.markAsVoid);
    this.excelSvc.exportToExcel(data, `Clien_Order_List_${currentData}`);
  }

  downloadSelected() {
    const orders = filterOrdersByMonthYear(
      this.orders,
      this.downloadMonth,
      this.downloadYear
    );
    const data = orders
      .map((item: TOrder) => {
        return {
          orderId: item.orderId,
          clienName: item.client?.clinicName || item.client?.docName,
          orderDate: item.orderDate,
          grandTotal: Number(item.grandTotal),
          receivedAmount: item.paidAmount,
          markAsVoid: item.markAsVoid,
        };
      })
      .sort((a, b) => {
        return (
          new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        );
      }).filter(item => !item.markAsVoid);
    this.excelSvc.exportToExcel(
      data,
      `Clien_Order_List_${this.downloadMonth.name}_${this.downloadYear.name}`
    );
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  async generateInvoice(orderParam: TOrder) {
    const order = structuredClone(orderParam);
    const orderDate =
      this.datePipe.transform(new Date(order.orderDate), 'mediumDate') || '';
    this.orderSvc.getInvoiceFromOrderId(order.orderId).subscribe((res) => {
      const invoiceData = res[0];
      const doc = getGeneratefPdf(invoiceData, order, orderDate, 'vedik');
      const fileName = `${order.client?.docName || order.client?.clinicName
        }_invoice.pdf`;
      doc.save(fileName);
    });
  }

  async previewInvoice(orderParam: TOrder) {
    const order = structuredClone(orderParam);
    const orderDate =
      this.datePipe.transform(new Date(order.orderDate), 'mediumDate') || '';
    this.orderSvc.getInvoiceFromOrderId(order.orderId).subscribe((res) => {
      const invoiceData = res[0];
      const doc = getGeneratefPdf(invoiceData, order, orderDate, 'vedik');
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      // Open in new tab
      window.open(url, '_blank');
    });
  }

  onEdit(order: TOrder) {
    this.setForm();
    this.isEdit = true;
    this.visible = true;
    this.orderSvc.getInvoiceFromOrderId(order.orderId).subscribe((res) => {
      this.invoiceData = res[0];
    });
    this.selectedOrder = order;
    const selectedClient = this.clientOptions.find(
      (item) => item.id === order.client?.id
    );
    order.items.forEach((item) => {
      this.addInput(item);
    });
    const selectedTransport = this.transportOptions.find(
      (item) => item.id === order.transport?.id
    );
    this.orderForm.setValue({
      clientName: selectedClient,
      transport: selectedTransport ?? {},
      orderDate: order.orderDate,
      items: order.items,
      paidAmount: order.paidAmount,
      totalBox: order.totalBox ?? 0,
    });
  }

  addOrder() {
    this.setForm();
    this.isEdit = false;
    this.addInput(null);
    this.selectedOrder = null;
    this.visible = true;
  }

  async onItemChange(event: any, index: number) {
    const selectedProduct = this.products.find(
      (item) => item.code === event.value.id
    );
    this.selectedProduct = selectedProduct ?? ({} as TProduct);
    this.items.controls.at(index)?.get('size')?.setValue(selectedProduct?.size);
    this.items.controls
      .at(index)
      ?.get('price')
      ?.setValue(selectedProduct?.price);
    this.items.controls.at(index)?.get('code')?.setValue(selectedProduct?.code);

    const data = await this.stockSvc.getStockByProductId(
      this.selectedProduct?.code ?? ''
    );
    this.items.controls.at(index)?.get('batchNo')?.setValue(data?.batchNo);
    this.inStockMsg[index] = `In stock ${data.remainingQuantity}`;
  }

  async onSave() {
    this.visible = false;
    const formValue = this.orderForm.getRawValue();
    const clientDetails = this.clients.find(
      (item) => item.id === formValue.clientName.id
    );
    let totalAmount = 0;
    let amountAfterDiscount = 0;
    formValue.items.forEach((element: any) => {
      totalAmount = totalAmount + element.price * element.quantity;
    });
    if (clientDetails?.discount && clientDetails?.discount.value) {
      if (clientDetails?.discount.name.includes('Flat')) {
        const discountPercentage = 100 - Number(clientDetails.discount.value);
        amountAfterDiscount = totalAmount * (discountPercentage / 100);
      } else {
        let tempTotal = 0;
        const [paid, free] = clientDetails.discount.name.split('+').map(Number); // Extract paid and free units
        formValue.items.forEach((element: any) => {
          const tempQuantity = Number(element.quantity);
          const sets = Math.floor(tempQuantity / (paid + free)); // Full scheme sets
          const remaining = tempQuantity % (paid + free); // Leftover units

          const payableQuantity =
            sets * paid + (remaining > paid ? paid : remaining);
          tempTotal = tempTotal + element.price * 0.8 * payableQuantity;
        });
        amountAfterDiscount = tempTotal;
      }
    } else {
      let tempTotal = 0;
      formValue.items.forEach((element: any) => {
        const tempQuantity = Number(element.quantity);
        tempTotal = tempTotal + Number(element.price) * tempQuantity;
      });
      amountAfterDiscount = tempTotal;
    }
    const transport = this.transport.find(
      (item) => item.id === formValue.transport.id
    );
    let isIGST = false;
    if (clientDetails?.tax) {
      isIGST = clientDetails?.tax.name.includes('IGST');
    }
    const gTotal = Number(
      (amountAfterDiscount + amountAfterDiscount * 0.05).toFixed(2)
    );
    const roundedGtotal = Math.round(
      Number((amountAfterDiscount + amountAfterDiscount * 0.05).toFixed(2))
    );
    const value = {
      client: clientDetails,
      transport: transport ?? ({} as TTransport),
      items: formValue.items,
      orderDate: formValue.orderDate,
      orderId: this.isEdit
        ? this.selectedOrder?.orderId ?? ''
        : `VH-00-${this.orders.length + 1}`,
      paidAmount: formValue.paidAmount ?? 0,
      totalAmount: totalAmount.toFixed(2),
      amountAfterDiscount: amountAfterDiscount.toFixed(2),
      amountWithSGST: !isIGST
        ? Number((amountAfterDiscount * 0.025).toFixed(2))
        : 0,
      amountWithCGST: !isIGST
        ? Number((amountAfterDiscount * 0.025).toFixed(2))
        : 0,
      amountWithIGST: isIGST
        ? Number((amountAfterDiscount * 0.05).toFixed(2))
        : 0,
      roundOff: Math.abs(gTotal - roundedGtotal),
      grandTotal: Number(roundedGtotal.toFixed(2)),
      totalBox: formValue.totalBox,
      markAsVoid: false,
    };
    if (!this.isEdit) {
      await this.orderSvc.addOrder(value);
      await this.orderSvc.addInvoice(value);
    } else {
      await this.orderSvc.updateOrder(value, this.selectedOrder?.id);
      await this.orderSvc.updateInvoice(value, this.invoiceData.id);
    }
    const key = value.client?.docName || value.client?.clinicName || '';
    await this.orderSvc.updatePayment(key, value.grandTotal, 'Add');
    this.updateStock(formValue.items);
  }

  confirmDelete(order: TOrder) {
    this.orderSvc
      .getInvoiceFromOrderId(order.orderId)
      .subscribe(async (res) => {
        this.invoiceData = res[0];
      });
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this order?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const value = {
          ...order,
          markAsVoid: true,
        };
        await this.orderSvc.updateOrder(value, order.id);
        await this.orderSvc.updateInvoice(value, this.invoiceData.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'Order mark as cancelled',
        });
        const key = value.client?.docName || value.client?.clinicName || '';
        await this.orderSvc.updatePayment(key, value.grandTotal, 'Delete');
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'You cancelled',
        });
      },
    });
  }

  addInput(item: OrderItem | null) {
    const inputGroup = this.formBuilder.group({
      productName: [item ? item.productName : ''],
      size: [item ? item.size : ''],
      price: [item ? item.price : ''],
      quantity: [item ? item.quantity : ''],
      hsn: [3304],
      code: [item ? item.code : ''],
      batchNo: [''],
    });
    this.items.push(inputGroup);
  }

  openDownloadModal() {
    this.isDownloadModal = true;
  }

  private updateStock(products: OrderItem[]) {
    products.forEach((item) => {
      this.stockSvc.updateStock(
        item.productName.id,
        Number(item.quantity),
        item.size
      );
    });
  }

  private setForm() {
    this.orderForm = new FormGroup({
      clientName: new FormControl(''),
      orderDate: new FormControl({
        value: new Date().toDateString(),
        disabled: true,
      }),
      transport: new FormControl(''),
      items: this.formBuilder.array([]),
      paidAmount: new FormControl(''),
      totalBox: new FormControl(''),
    });
  }

  private async getAllClients() {
    this.clientSvc.getAllClients().subscribe({
      next: (response) => {
        this.clients = response;
        this.clientOptions = response.map((item) => {
          return {
            name: item.docName || item.clinicName,
            id: item.id || '',
          };
        });
      },
      error: (error: unknown) => { },
    });
  }

  private getAllProducts() {
    this.productSvc.getProducts().subscribe((response) => {
      this.products = response;
      this.productOptions = response.map((item: any) => {
        return {
          name: `${item.name} ${item.category}`,
          id: item.code,
        };
      });
    });
  }

  private async getAllTransport() {
    this.transportSvc.getAllTransport().subscribe({
      next: (response) => {
        this.transport = response;
        this.transportOptions = response.map((item) => {
          return {
            name: item.name,
            id: item.id || '',
          };
        });
      },
      error: (error: unknown) => { },
    });
  }

  private async getAllOrder() {
    this.orderSvc.getAllOrders().subscribe({
      next: (response) => {
        this.total = 0;
        this.paidTotal = 0;
        this.orders = response.sort((a, b) => {
          const numA = parseInt(a.orderId.split("-").pop() ?? "0", 10);
          const numB = parseInt(b.orderId.split("-").pop() ?? "0", 10);
          return numB - numA;
        });
      },
      error: (error: unknown) => { },
    });
  }
}
