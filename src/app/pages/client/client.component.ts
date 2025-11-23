import { Component, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PHONE_NUMBER_VALIDATOR,
  ZIPCODE_VALIDATOR,
} from '../../shared/utils/constant';
import { ClientService } from './client.service';
import { TClient } from './client.types';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { Router } from '@angular/router';
@Component({
  selector: 'vhb-client',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    Select,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit {
  visible: boolean = false;
  clientForm!: FormGroup;
  clients: TClient[] = [];
  selectedClient!: TClient;
  isEdit = false;
  discountOptions = [
    {
      name: 'Nil',
      value: '',
    },
    {
      name: 'Flat 20%',
      value: '20',
    },
    {
      name: 'Flat 30%',
      value: '30',
    },
    {
      name: 'Flat 40%',
      value: '40',
    },
    {
      name: 'Flat 50%',
      value: '50',
    },
    {
      name: 'Flat 60%',
      value: '60',
    },
    {
      name: 'Flat 70%',
      value: '70',
    },
    {
      name: '3 + 3',
      value: '3',
    },
    {
      name: '4 + 2',
      value: '4',
    },
    {
      name: '5 + 1',
      value: '5',
    },
  ];
  taxOptions = [
  {
      name: 'Nil',
      value: '',
    },
    {
      name: 'IGST 5%',
      value: 5,
    },
    {
      name: 'SGST 2.5% + CGST 2.5%',
      value: 5,
    },
  ];
  constructor(private clientSvc: ClientService, private router: Router) {}

  ngOnInit(): void {
    this.setForm();
    this.getAllClients();
  }

  goToDetails(clientId: string) {
    this.router.navigate(['/client', clientId]);
  }

  async onSave() {
    if (!this.clientForm.valid) {
      return;
    }
    this.visible = false;
    if (this.isEdit) {
      await this.clientSvc.updateClient(
        this.clientForm.value,
        this.selectedClient.id ?? ''
      );
      this.isEdit = false;
    } else {
      await this.clientSvc.addClient(this.clientForm.value);
    }

    this.clientForm.reset();
  }

  showDialog() {
    this.visible = true;
  }

  async deleteClient(id: string) {
    await this.clientSvc.deleteClient(id);
  }

  onEdit(item: TClient) {
    this.visible = true;
    this.isEdit = true;
    this.selectedClient = item;
    this.clientForm.setValue({
      docName: item.docName,
      clinicName: item.clinicName,
      email: item.email,
      phoneNo: item.phoneNo,
      address: item.address,
      city: item.city,
      state: item.state,
      postCode: item.postCode,
      discount: item.discount,
      tax: item.tax ?? '',
      gstNo: item.gstNo ?? '',
    });
  }

  private async getAllClients() {
    this.clientSvc.getAllClients().subscribe({
      next: (response) => {
        this.clients = response;
        console.log(response);
      },
      error: (error: unknown) => {},
    });
  }

  private setForm() {
    this.clientForm = new FormGroup({
      docName: new FormControl(''),
      clinicName: new FormControl(''),
      email: new FormControl(''),
      phoneNo: new FormControl('', [
        Validators.pattern(PHONE_NUMBER_VALIDATOR),
      ]),
      address: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      postCode: new FormControl('', [Validators.pattern(ZIPCODE_VALIDATOR)]),
      discount: new FormControl(''),
      tax: new FormControl(''),
      gstNo: new FormControl(''),
    });
  }
}
