import { isPlatformBrowser, NgFor } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { MONTHS } from '../../shared/utils/constant';
import { OrderService } from '../order/order.service';
import { groupByMonth } from '../../shared/utils/helper';
import { TGroupedExpense, TGroupedOrder, TGroupedPayment } from './dashboard.types';
import { ExpenseService } from '../expense/expense.service';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../payments/payments.service';
import { TPayments } from '../payments/payments.types';
@Component({
  selector: 'vhb-dashboard',
  imports: [ChartModule, FormsModule, NgFor],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  orderData: any;
  orderOptions: any;
  revenueData: any;
  revenueRes: any;
  orderRes: any;
  revenueOptions: any;
  groupedExpenses!: TGroupedExpense;
  platformId = inject(PLATFORM_ID);
  groupedOrders!: TGroupedOrder;
  payments!: TPayments[];
  groupedPayment!: TGroupedPayment;
  availableYears: number[] = [2024, 2025];
  selectedYear: number = new Date().getFullYear();

  constructor(
    private cd: ChangeDetectorRef,
    private orderSvc: OrderService,
    private expenseSvc: ExpenseService,
    private paymentSvc: PaymentService
  ) { }

  ngOnInit(): void {
    this.getAllOrder();
  }

  initOrderChart() {
    const currentMonth = new Date().getMonth();
    const labels = [];
    const data = [];
    for (let i = 0; i <= currentMonth; i++) {
      const tempLabel = MONTHS[i];
      labels.push(tempLabel);
      if (this.groupedOrders[tempLabel]) {
        data.push(this.groupedOrders[tempLabel].length);
      } else {
        data.push(0);
      }
    }

    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );

      this.orderData = {
        labels: labels,
        datasets: [
          {
            label: 'Orders',
            backgroundColor: ['#2d6a4f'],
            data,
            borderWidth: 1,
          },
        ],
      };

      this.orderOptions = {
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };
      this.cd.markForCheck();
      this.getAllExpense();
    }
  }

  initRevenueChart() {
    const currentMonth = new Date().getMonth();
    const labels = [];
    const orderTotalAmount = [];
    const expenseAmount = [];
    const receivedAmount = [];
    for (let i = 0; i <= currentMonth; i++) {
      const tempLabel = MONTHS[i];
      labels.push(tempLabel);
      if (this.groupedOrders[tempLabel]) {
        let tempTotal = 0;
        let tempRecivedTotal = 0;
        this.groupedOrders[tempLabel]?.forEach((item) => {
          tempTotal = tempTotal + Number(item.grandTotal);
          tempRecivedTotal = tempRecivedTotal + Number(item.paidAmount);
        });
        this.groupedPayment[tempLabel]?.forEach((item) => {
          tempRecivedTotal = tempRecivedTotal + Number(item.receivedPayment);
        });
        orderTotalAmount.push(tempTotal);
        receivedAmount.push(tempRecivedTotal);
      } else {
        orderTotalAmount.push(0);
        receivedAmount.push(0);
      }
      if (this.groupedExpenses[tempLabel]) {
        let tempTotal = 0;
        this.groupedExpenses[tempLabel].forEach((item) => {
          tempTotal = tempTotal + Number(item.amount);
        });
        expenseAmount.push(tempTotal);
      } else {
        expenseAmount.push(0);
      }
    }
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );

      this.revenueData = {
        labels,
        datasets: [
          {
            label: 'Total Order',
            backgroundColor: '#003459',
            borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
            data: orderTotalAmount,
          },
          {
            label: 'Total Expense',
            backgroundColor: '#5bc0be',
            borderColor: documentStyle.getPropertyValue('--p-gray-500'),
            data: expenseAmount,
          },
          {
            label: 'Received Amount',
            backgroundColor: '#55828b',
            borderColor: documentStyle.getPropertyValue('--p-gray-500'),
            data: receivedAmount,
          },
        ],
      };

      this.revenueOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500,
              },
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  onYearChange() {
    this.groupedExpenses = groupByMonth(
      this.revenueRes,
      Number(this.selectedYear)
    );
    this.groupedOrders = groupByMonth(this.orderRes, Number(this.selectedYear));
    this.initRevenueChart();
  }

  private async getAllOrder() {
    this.orderSvc.getAllOrders().subscribe({
      next: (response) => {
        this.orderRes = response.filter(item => !item.markAsVoid);
        this.groupedOrders = groupByMonth(this.orderRes, this.selectedYear);

        this.initOrderChart();
      },
      error: (error: unknown) => { },
    });
  }

  private async getAllExpense() {
    this.expenseSvc.getAllExpense().subscribe({
      next: (response) => {
        this.revenueRes = response;
        this.groupedExpenses = groupByMonth(response, this.selectedYear);

        this.getAllPayments();
      },
      error: (error: unknown) => { },
    });
  }

  private async getAllPayments() {
    this.paymentSvc.getAllPayments().subscribe({
      next: (response) => {
        this.payments = response
        this.groupedPayment = groupByMonth(response, this.selectedYear)
        this.initRevenueChart();
      },
      error: (error: unknown) => { },
    });
  }
}
