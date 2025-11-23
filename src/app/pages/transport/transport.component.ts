import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TTransport } from './transport.types';
import { TransportService } from './transport.service';
import {
  PHONE_NUMBER_VALIDATOR,
  ZIPCODE_VALIDATOR,
} from '../../shared/utils/constant';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'vhb-transport',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
  ],
  templateUrl: './transport.component.html',
  styleUrl: './transport.component.scss',
})
export class TransportComponent {
  visible: boolean = false;
  transportForm!: FormGroup;
  transport: TTransport[] = [];
  constructor(private transportSvc: TransportService) {}

  ngOnInit(): void {
    this.setForm();
    this.getAllTransport();
  }

  async onSave() {
    if (!this.transportForm.valid) {
      return;
    }
    this.visible = false;
    await this.transportSvc.addTransport(this.transportForm.value);

    this.transportForm.reset();
  }

  showDialog() {
    this.visible = true;
  }

  private async getAllTransport() {
    this.transportSvc.getAllTransport().subscribe({
      next: (response) => {
        this.transport = response;
      },
      error: (error: unknown) => {},
    });
  }

  private setForm() {
    this.transportForm = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      phoneNo: new FormControl('', [
        Validators.pattern(PHONE_NUMBER_VALIDATOR),
      ]),
      address: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      postCode: new FormControl('', [Validators.pattern(ZIPCODE_VALIDATOR)]),
    });
  }
}
