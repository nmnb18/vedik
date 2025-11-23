import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TPayments } from './payments.types';
import { PaymentService } from './payments.service';

@Component({
    selector: 'vhb-payments',
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
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.scss',
    providers: [DatePipe],
})
export class PaymentsComponent {
    visible: boolean = false;
    paymentsForm!: FormGroup;
    payments: TPayments[] = [];
    total: number = 0;
    paidTotal: number = 0;
    paymentOptions = [
        {
            name: 'Nil',
            value: '',
        },
        {
            name: 'Cash',
            value: 'Cash',
        },
        {
            name: 'Online - MB Account (IDFC)',
            value: 'Online - MB Account (IDFC)',
        },
        {
            name: 'Online - UB Account (PNB)',
            value: 'Online - UB Account (PNB)',
        },
        {
            name: 'Online - Vedik Account (IDFC)',
            value: 'Online - Vedik Account (IDFC)',
        },
    ];
    selectedPayment!: TPayments;
    isEdit = false;
    constructor(private datePipe: DatePipe, private paymentSvc: PaymentService) { }

    ngOnInit(): void {
        this.setForm();
        this.getAllPayments();
    }

    onEdit(item: TPayments) {
        this.visible = true;
        this.isEdit = true;
        this.selectedPayment = item;
        this.paymentsForm.setValue({
            name: item.name,
            paymentDate: item.paymentDate ? new Date(item.paymentDate) : new Date(),
            paymentMode: item.paymentMode ?? '',
            receivedPayment: 0,
            totalPayment: item.totalPayment
        });
    }

    async onSave() {
        if (!this.paymentsForm.valid) {
            return;
        }
        this.visible = false;
        const value = {
            ...this.paymentsForm.value,
            paymentDate: this.datePipe.transform(
                this.paymentsForm.value.paymentDate,
                'fullDate'
            ),
            receivedPayment: Number(this.selectedPayment.receivedPayment) + Number(this.paymentsForm.value.receivedPayment)
        };
        console.log('value', value);
        await this.paymentSvc.updatePayment(value, this.selectedPayment.id ?? '');
        //   this.isEdit = false;

        this.paymentsForm.reset();
    }

    showDialog() {
        this.paymentsForm.reset();
        this.visible = true;
    }

    private async getAllPayments() {
        this.paymentSvc.getAllPayments().subscribe({
            next: (response) => {
                this.total = 0;
                this.paidTotal = 0;
                this.payments = response
                    .map((item) => {
                        this.total = this.total + Number(item.totalPayment);
                        this.paidTotal = this.paidTotal + Number(item.receivedPayment);
                        return item;
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));
            },
            error: (error: unknown) => { },
        });
    }

    private setForm() {
        this.paymentsForm = new FormGroup({
            name: new FormControl({ value: '', disabled: true }),
            paymentDate: new FormControl(''),
            paymentMode: new FormControl(''),
            receivedPayment: new FormControl(''),
            totalPayment: new FormControl({ value: '', disabled: true })
        });
    }
}
