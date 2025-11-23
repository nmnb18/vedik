export type Discount = {
  name: string;
  value: string;
};

export type TClient = {
  docName: string;
  id?: string;
  clinicName: string;
  email: string;
  phoneNo: string;
  address: string;
  postCode: string;
  city: string;
  state: string;
  discount: Discount;
  tax: Discount;
  gstNo?: string;
};
