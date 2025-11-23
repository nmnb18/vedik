import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { DatePipe, CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductService } from '../product/product.service';
import { ClientService } from '../client/client.service';
import { TransportService } from '../transport/transport.service';
import { StockService } from '../stock/stock.service';
import { ExcelExportService } from '../../shared/service/excel-export.service';

import { TProduct } from '../product/product.type';
import { TClient } from '../client/client.types';
import { TTransport } from '../transport/transport.types';

import { CpOrderService } from './cp-order.service';
import { CpOrderItem, TCpOrder, TCpInvoice } from './cp-order.types';

import { getGeneratefPdf, filterOrdersByMonthYear } from '../../shared/utils/helper';

type Options = {
    id: string;
    name: string;
};

@Component({
    selector: 'cp-order',
    templateUrl: './cp-order.component.html',
    styleUrls: ['./cp-order.component.scss'],
    providers: [DatePipe],
    standalone: true,
    imports: [
        DialogModule,
        TableModule,
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
        SelectModule,
        IconFieldModule,
        InputIconModule,
        CommonModule
    ]
})
export class CpOrderComponent implements OnInit {

    @ViewChild('dt2') dt2!: Table;

    clients: TClient[] = [];
    clientOptions: Options[] = [];

    productOptions: Options[] = [];
    products!: TProduct[];

    transport!: TTransport[];
    transportOptions: Options[] = [];

    orders!: TCpOrder[];
    orderForm!: FormGroup;

    visible = false;
    isEdit = false;
    selectedOrder!: TCpOrder | null;
    selectedProduct!: TProduct;

    invoiceData!: TCpInvoice;
    todaysDate = new Date().toDateString();
    inStockMsg: any = {};

    total = 0;
    paidTotal = 0;

    isDownloadModal = false;
    downloadMonth: any;
    downloadYear: any;

    monthOptions = [
        { name: 'Jan', id: 1, value: 1 },
        { name: 'Feb', id: 2, value: 2 },
        { name: 'Mar', id: 3, value: 3 },
        { name: 'Apr', id: 4, value: 4 },
        { name: 'May', id: 5, value: 5 },
        { name: 'Jun', id: 6, value: 6 },
        { name: 'Jul', id: 7, value: 7 },
        { name: 'Aug', id: 8, value: 8 },
        { name: 'Sep', id: 9, value: 9 },
        { name: 'Oct', id: 10, value: 10 },
        { name: 'Nov', id: 11, value: 11 },
        { name: 'Dec', id: 12, value: 12 }
    ];

    yearOptions = [
        { name: '2025', id: 2025, value: 2025 },
        { name: '2026', id: 2026, value: 2026 },
        { name: '2027', id: 2027, value: 2027 }
    ];

    constructor(
        private productSvc: ProductService,
        private clientSvc: ClientService,
        private transportSvc: TransportService,
        private cpOrderSvc: CpOrderService,
        private stockSvc: StockService,
        private excelSvc: ExcelExportService,
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.setForm();
        this.getAllProducts();
        this.getAllClients();
        this.getAllTransport();
        this.getAllOrders();
    }

    // -----------------------------
    // FORM GETTERS
    // -----------------------------
    get items(): FormArray {
        return this.orderForm.get('items') as FormArray;
    }

    // -----------------------------
    // FILTERING
    // -----------------------------
    onGlobalFilter(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.dt2.filterGlobal(input.value, 'contains');
    }

    getFilteredTotal(): number {
        const data = this.dt2?.filteredValue || this.orders;
        return data.filter(x => !x.markAsVoid)
            .reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);
    }

    getRecievedTotal(): number {
        const data = this.dt2?.filteredValue || this.orders;
        return data.filter(x => !x.markAsVoid)
            .reduce((sum, order) => sum + Number(order.paidAmount || 0), 0);
    }

    // -----------------------------
    // DOWNLOAD EXCEL (ALL)
    // -----------------------------
    downloadExcel() {
        const now = new Date().toISOString();
        const data = this.orders
            .map(order => ({
                orderId: order.orderId,
                clientName: order.client?.clinicName || order.client?.docName,
                orderDate: order.orderDate,
                grandTotal: order.grandTotal,
                receivedAmount: order.paidAmount,
                markAsVoid: order.markAsVoid
            }))
            .filter(x => !x.markAsVoid);

        this.excelSvc.exportToExcel(data, `CP_Order_List_${now}`);
    }

    // -----------------------------
    // DOWNLOAD SELECTED (MONTH/YEAR)
    // -----------------------------
    downloadSelected() {
        const orders = filterOrdersByMonthYear(
            this.orders,
            this.downloadMonth,
            this.downloadYear
        );

        const data = orders
            .filter(x => !x.markAsVoid)
            .map(order => ({
                orderId: order.orderId,
                clientName: order.client?.clinicName || order.client?.docName,
                orderDate: order.orderDate,
                grandTotal: order.grandTotal,
                receivedAmount: order.paidAmount
            }));

        this.excelSvc.exportToExcel(
            data,
            `CP_Order_List_${this.downloadMonth?.name}_${this.downloadYear?.name}`
        );
    }

    // -----------------------------
    // ADD ORDER MODAL
    // -----------------------------
    addOrder() {
        this.setForm();
        this.visible = true;
        this.isEdit = false;
        this.addInput(null);
        this.selectedOrder = null;
    }

    // -----------------------------
    // EDIT ORDER
    // -----------------------------
    onEdit(order: TCpOrder) {
        this.setForm();
        this.isEdit = true;
        this.visible = true;

        this.cpOrderSvc.getInvoiceFromOrderId(order.orderId).subscribe(res => {
            this.invoiceData = res[0];
        });

        this.selectedOrder = order;

        const client = this.clientOptions.find(x => x.id === order.client?.id);
        const transport = this.transportOptions.find(x => x.id === order.transport?.id);

        order.items.forEach(item => this.addInput(item));

        this.orderForm.setValue({
            clientName: client,
            transport: transport || {},
            orderDate: order.orderDate,
            items: order.items,
            paidAmount: order.paidAmount,
            totalBox: order.totalBox || 0
        });
    }

    // -----------------------------
    // DYNAMIC ITEM INPUT
    // -----------------------------
    addInput(item: CpOrderItem | null) {
        const group = this.fb.group({
            productName: [item ? item.productName : ''],
            batchNo: [item ? item.batchNo : ''],
            size: [item ? item.size : ''],
            quantity: [item ? item.quantity : ''],
            price: [item ? item.price : ''],
            hsn: ['3304'],
            code: [item ? item.code : '']
        });

        this.items.push(group);
    }

    // -----------------------------
    // SAVE ORDER
    // -----------------------------
    async onSave() {
        this.visible = false;
        const formValue = this.orderForm.getRawValue();

        const clientDetails = this.clients.find(c => c.id === formValue.clientName.id);
        const transport = this.transport.find(t => t.id === formValue.transport.id);

        let totalAmount = 0;
        formValue.items.forEach((item: any) => {
            totalAmount += item.price * item.quantity;
        });

        let amountAfterDiscount = totalAmount;

        if (clientDetails?.discount?.value) {
            if (clientDetails.discount.name.includes('Flat')) {
                const discountPercent = 100 - Number(clientDetails.discount.value);
                amountAfterDiscount = totalAmount * (discountPercent / 100);
            } else {
                let tempTotal = 0;
                const [paid, free] = clientDetails.discount.name.split('+').map(Number);
                formValue.items.forEach((item: any) => {
                    const qty = Number(item.quantity);
                    const sets = Math.floor(qty / (paid + free));
                    const remaining = qty % (paid + free);
                    const payable = sets * paid + (remaining > paid ? paid : remaining);

                    tempTotal += item.price * 0.8 * payable;
                });
                amountAfterDiscount = tempTotal;
            }
        }

        const isIGST = clientDetails?.tax?.name.includes('IGST');

        const gstAmt = amountAfterDiscount * 0.05;
        const grand = Number((amountAfterDiscount + gstAmt).toFixed(2));
        const rounded = Math.round(grand);

        const orderObj: TCpOrder = {
            client: clientDetails,
            transport: transport,
            items: formValue.items,
            orderDate: formValue.orderDate,
            orderId: this.isEdit
                ? this.selectedOrder?.orderId || ''
                : `CP-00-${this.orders.length + 1}`,
            paidAmount: formValue.paidAmount || 0,
            totalAmount: totalAmount.toFixed(2),
            amountAfterDiscount: amountAfterDiscount.toFixed(2),
            amountWithCGST: isIGST ? 0 : Number((amountAfterDiscount * 0.025).toFixed(2)),
            amountWithSGST: isIGST ? 0 : Number((amountAfterDiscount * 0.025).toFixed(2)),
            amountWithIGST: isIGST ? Number((amountAfterDiscount * 0.05).toFixed(2)) : 0,
            roundOff: Math.abs(grand - rounded),
            grandTotal: rounded,
            totalBox: formValue.totalBox,
            markAsVoid: false
        };

        if (!this.isEdit) {
            await this.cpOrderSvc.addOrder(orderObj);
            await this.cpOrderSvc.addInvoice(orderObj);
        } else {
            await this.cpOrderSvc.updateOrder(orderObj, this.selectedOrder?.id);
            await this.cpOrderSvc.updateInvoice(orderObj, this.invoiceData.id);
        }

        const key = orderObj.client?.docName || orderObj.client?.clinicName || '';
        await this.cpOrderSvc.updatePayment(key, orderObj.grandTotal, this.isEdit ? 'Edit' : 'Add');

        this.updateStock(formValue.items);
    }

    // -----------------------------
    // DELETE ORDER
    // -----------------------------
    confirmDelete(order: TCpOrder) {
        this.cpOrderSvc.getInvoiceFromOrderId(order.orderId).subscribe(res => {
            this.invoiceData = res[0];
        });

        this.confirmationService.confirm({
            message: 'Do you want to cancel this order?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const value = { ...order, markAsVoid: true };
                await this.cpOrderSvc.updateOrder(value, order.id);
                await this.cpOrderSvc.updateInvoice(value, this.invoiceData.id);

                const key = value.client?.docName || value.client?.clinicName || '';
                await this.cpOrderSvc.updatePayment(key, value.grandTotal, 'Delete');

                this.messageService.add({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Order marked as cancelled'
                });
            }
        });
    }

    // -----------------------------
    // INVOICE GENERATION
    // -----------------------------
    previewInvoice(order: TCpOrder) {
        this.cpOrderSvc.getInvoiceFromOrderId(order.orderId).subscribe(res => {
            const invoice = res[0];
            const orderDate = this.datePipe.transform(new Date(order.orderDate), 'mediumDate');
            const doc = getGeneratefPdf(invoice, order, orderDate || '', 'cp');
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        });
    }

    generateInvoice(order: TCpOrder) {
        this.cpOrderSvc.getInvoiceFromOrderId(order.orderId).subscribe(res => {
            const invoice = res[0];
            const orderDate = this.datePipe.transform(new Date(order.orderDate), 'mediumDate');
            const doc = getGeneratefPdf(invoice, order, orderDate || '', 'cp');

            const name = `${order.client?.docName || order.client?.clinicName}_invoice.pdf`;
            doc.save(name);
        });
    }

    // -----------------------------
    // STOCK UPDATE
    // -----------------------------
    private updateStock(products: CpOrderItem[]) {
        products.forEach(item => {
            this.stockSvc.updateStock(item.productName.id, Number(item.quantity), item.size);
        });
    }

    // -----------------------------
    // INITIALIZATION LOADERS
    // -----------------------------
    private setForm() {
        this.orderForm = new FormGroup({
            clientName: new FormControl(''),
            orderDate: new FormControl({ value: new Date().toDateString(), disabled: true }),
            transport: new FormControl(''),
            items: this.fb.array([]),
            paidAmount: new FormControl(''),
            totalBox: new FormControl('')
        });
    }

    private getAllProducts() {
        this.productSvc.getProducts().subscribe(res => {
            this.products = res;
            this.productOptions = res.map((x: any) => ({
                name: `${x.name} ${x.category}`,
                id: x.code
            }));
        });
    }

    private getAllClients() {
        this.clientSvc.getAllClients().subscribe(res => {
            this.clients = res;
            this.clientOptions = res.map(x => ({
                name: x.docName || x.clinicName,
                id: x.id || ''
            }));
        });
    }

    private getAllTransport() {
        this.transportSvc.getAllTransport().subscribe(res => {
            this.transport = res;
            this.transportOptions = res.map(t => ({
                name: t.name,
                id: t.id || ''
            }));
        });
    }

    private getAllOrders() {
        this.cpOrderSvc.getAllOrders().subscribe(res => {
            this.orders = res.sort((a, b) => {
                const numA = parseInt(a.orderId.split("-").pop() || "0", 10);
                const numB = parseInt(b.orderId.split("-").pop() || "0", 10);
                return numB - numA;
            });
        });
    }

    // -----------------------------
    // DOWNLOAD MODAL
    // -----------------------------
    openDownloadModal() {
        this.isDownloadModal = true;
    }
}
