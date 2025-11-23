import { TExpense } from '../expense/expense.types';
import { TOrder } from '../order/order.types';
import { TPayments } from '../payments/payments.types';

export type TGroupedOrder = {
  [key: string]: TOrder[];
};

export type TGroupedExpense = {
  [key: string]: TExpense[];
};

export type TGroupedPayment = {
  [key: string]: TPayments[];
}