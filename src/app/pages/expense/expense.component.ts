import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TExpense } from './expense.types';
import { ExpenseService } from './expense.service';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'vhb-expense',
  imports: [
    Select,
    DatePickerModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TableModule,
  ],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss',
  providers: [DatePipe],
})
export class ExpenseComponent {
  visible: boolean = false;
  expenseForm!: FormGroup;
  expenses: TExpense[] = [];
  total: number = 0;
  paidTotal: number = 0;
  categoryOptions = [
    {
      name: 'Raw Material',
      value: 'Raw Material',
    },
    {
      name: 'Stationary',
      value: 'Stationary',
    },
    {
      name: 'Packaging',
      value: 'Packaging',
    },
    {
      name: 'Other',
      value: 'Other',
    },
  ];
  paymentOptions = [
    {
      name: 'Online',
      value: 'Online',
    },
    {
      name: 'Cash',
      value: 'Cash',
    },
  ];
  selectedExpense!: TExpense;
  isEdit = false;
  constructor(private expenseSvc: ExpenseService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.setForm();
    this.getAllExpense();
  }

  onEdit(item: TExpense) {
    this.visible = true;
    this.isEdit = true;
    this.selectedExpense = item;
    this.expenseForm.setValue({
      name: item.name,
      merchantName: item.merchantName,
      category: item.category,
      expenseDate: new Date(item.expenseDate),
      paymentMode: item.paymentMode,
      amount: item.amount,
      paid: item.paid,
      paidFrom: item.paidFrom ?? ''
    });
  }

  async onSave() {
    if (!this.expenseForm.valid) {
      return;
    }
    this.visible = false;
    console.log(this.expenseForm.value.expenseDate);
    const value = {
      ...this.expenseForm.value,
      // expenseDate: this.datePipe.transform(
      //   this.expenseForm.value.expenseDate,
      //   'dd/MM/yyyy'
      // ),
      expenseDate: this.datePipe.transform(
        this.expenseForm.value.expenseDate,
        'fullDate'
      ),
    };
    if (!this.isEdit) {
      await this.expenseSvc.addExpense(value);
    } else {
      await this.expenseSvc.updateExpense(value, this.selectedExpense.id ?? '');
      this.isEdit = false;
    }

    this.expenseForm.reset();
  }

  showDialog() {
    this.expenseForm.reset();
    this.visible = true;
  }

  private async getAllExpense() {
    this.expenseSvc.getAllExpense().subscribe({
      next: (response) => {
        this.total = 0;
        this.paidTotal = 0;
        this.expenses = response
          .map((item) => {
            this.total = this.total + Number(item.amount);
            this.paidTotal = this.paidTotal + Number(item.paid);
            return item;
          })
          .sort((a, b) => {
            return (
              new Date(b.expenseDate).getTime() -
              new Date(a.expenseDate).getTime()
            );
          });
      },
      error: (error: unknown) => {},
    });
  }

  private setForm() {
    this.expenseForm = new FormGroup({
      name: new FormControl(''),
      merchantName: new FormControl(''),
      category: new FormControl(''),
      expenseDate: new FormControl(''),
      paymentMode: new FormControl(''),
      amount: new FormControl(''),
      paid: new FormControl(''),
      paidFrom: new FormControl('')
    });
  }
}
