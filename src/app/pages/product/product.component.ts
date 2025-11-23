import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TProduct } from './product.type';
import { ProductService } from './product.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'vhb-product',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    Select,
    DialogModule,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  productForm!: FormGroup;
  categoryOptions = [
    {
      name: 'Syrup',
      value: 'Syrup',
    },
    {
      name: 'Tablet',
      value: 'Tab',
    },
    {
      name: 'Churan',
      value: 'Churan',
    },
  ];
  products!: TProduct[];
  visible: boolean = false;
  constructor(private productSvc: ProductService) {}

  ngOnInit(): void {
    this.setForm();
    this.productSvc.getProducts().subscribe((response) => {
      this.products = response.sort((a: any, b: any) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    });
  }

  showDialog() {
    this.visible = true;
  }

  async onSave() {
    if (!this.productForm.valid) {
      return;
    }
    this.visible = false;

    await this.productSvc.addProduct({
      ...this.productForm.value,
      category: this.productForm.value.category.value,
    });
    this.productForm.reset();
  }

  private setForm() {
    this.productForm = new FormGroup({
      name: new FormControl(''),
      code: new FormControl(''),
      size: new FormControl(''),
      price: new FormControl(''),
      category: new FormControl(''),
    });
  }
}
