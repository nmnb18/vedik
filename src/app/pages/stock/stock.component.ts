import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TStock } from './stock.types';
import { StockService } from './stock.service';
import { ProductService } from '../product/product.service';
import { TProduct } from '../product/product.type';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule, DatePipe } from '@angular/common';

type Options = {
  id: string;
  name: string;
};
@Component({
  selector: 'vhb-stock',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    TableModule,
    CommonModule,
    Select,
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss',
  providers: [DatePipe],
})
export class StockComponent {
  visible: boolean = false;
  stockForm!: FormGroup;
  stocks: TStock[] = [];
  productOptions: Options[] = [];
  orderForm!: FormGroup;
  sizeOptions = [
    {
      name: '100ml',
      value: '100ml',
    },
    {
      name: '200ml',
      value: '200ml',
    },
    ,
    {
      name: '60ml',
      value: '60ml',
    },
    {
      name: '60 Tab',
      value: '60 Tab',
    },
    {
      name: '100gm',
      value: '100gm',
    },
  ];

  constructor(
    private stockSvc: StockService,
    private productSvc: ProductService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.productSvc.getProducts().subscribe((response) => {
      this.productOptions = response.map((item: any) => {
        return {
          name: `${item.name} ${item.category}`,
          id: item.code,
        };
      });
    });
    this.setForm();
    this.getAllStocks();
  }

  async onSave() {
    if (!this.stockForm.valid) {
      return;
    }
    this.visible = false;
    const { productName, size, quantity, batchNo, stockDate } =
      this.stockForm.value;
    const value = {
      productName: productName.name,
      productId: productName.id,
      size,
      actualQuantity: Number(quantity),
      remainingQuantity: Number(quantity),
      batchNo,
      stockDate: this.datePipe.transform(stockDate, 'fullDate') ?? '',
    };
    await this.stockSvc.addStock(value);
    this.stockForm.reset();
  }

  showDialog() {
    this.visible = true;
  }

  private async getAllStocks() {
    this.stockSvc.getAllStock().subscribe({
      next: (response) => {
        this.stocks = response.sort((a: TStock, b: TStock) => {
          return Number(a.batchNo) - Number(b.batchNo);
        });
      },
      error: (error: unknown) => {},
    });
  }

  private setForm() {
    this.stockForm = new FormGroup({
      productName: new FormControl(''),
      stockDate: new FormControl(''),
      batchNo: new FormControl(''),
      quantity: new FormControl(''),
      size: new FormControl(''),
    });
  }
}
