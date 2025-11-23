import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../client.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';
import { TOrder } from '../../order/order.types';
import { OrderService } from '../../order/order.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'vhb-client-details',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    TableModule,
  ],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss',
})
export class ClientDetailsComponent implements OnInit {
  client: any = {};
  orders: any[] = [];
  totalAmount: number = 0;
  totalReceived: number = 0;
  clientId: string = '';
  @ViewChild('ledgerTable') ledgerTable!: Table;

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id') || '';
    this.loadClient();
    this.loadOrders();
  }

  getName() {
    if (this.client.clinicName && this.client.docName) {
      return `${this.client.docName}, ${this.client.clinicName}`;
    } else if (this.client.clinicName && !this.client.docName) {
      return this.client.clinicName;
    } else {
      return this.client.docName;
    }
  }

  print() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/client']);
  }

  loadClient() {
    if (this.clientId)
      this.clientService.getClientById(this.clientId).subscribe((res) => {
        this.client = res;
      });
  }

  async onRowEditSave(updatedOrder: TOrder) {
    if (!updatedOrder.id || updatedOrder.paidAmount.toString() === '') return;
    try {
      await this.orderService.updateOrderValue(updatedOrder.id, {
        paidAmount: updatedOrder.paidAmount,
      });
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Received amount updated!',
      });
      this.loadOrders();
    } catch (error) {
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Error Occured!',
      });
    }
  }

  async loadOrders() {
    if (this.clientId)
      this.orders = await this.clientService.getClientOrders(this.clientId);

    this.calculateTotals();
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.ledgerTable.filterGlobal(value, 'contains');
  }

  calculateTotals() {
    this.totalAmount = this.orders.reduce((acc, o) => acc + o.grandTotal, 0);
    this.totalReceived = this.orders.reduce((acc, o) => acc + Number((o.paidAmount ?? 0)), 0);
  }
}
