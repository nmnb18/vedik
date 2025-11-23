export type TExpense = {
  id?: string;
  name: string;
  merchantName: string;
  category: string;
  paymentMode: string;
  expenseDate: string;
  amount: string;
  paid: string;
  remaining: string;
  paidFrom?: string;
};
