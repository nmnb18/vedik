export type TPayments = {
    id: string;
    clientId: string;
    name: string;
    totalPayment: string;
    receivedPayment: string;
    paymentDate: string;
    paymentMode: {
        name: string;
        value: string
    };
}