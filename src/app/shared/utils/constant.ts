export const PHONE_NUMBER_VALIDATOR = '^[0-9]{10}$';
export const ZIPCODE_VALIDATOR = '^[0-9]{6}$';

export const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];


export const ORDER_CONFIG = {
  vedik: {
    companyName: "VEDIK HEALTHCARE",
    addressLine1: "Kh.No. 47/738/1/1/2 Indraprasth,",
    addressLine2: "Opp, 5 Bangla Rangwasa (Rau) Indore (M.P.)",
    phone: "+91-9407367665",
    email: "",
    gst: "23AWMPJ2825Q1Z3",
    stateCode: "23",
    bank: {
      name: "Vedik Health Care",
      account: "10216071291",
      ifsc: "IDFB0041261",
    },
    logo: "/images/logo-dark.png",
    textColor: "#f58537",
    tableHeader: [120, 194, 85],
  },

  cp: {
    companyName: "CP Pharma",
    addressLine1: "M-39, Silicon City, Rau",
    addressLine2: "Indore, (M.P.) - 452012",
    phone: "+91-9893206866",
    email: "cppharma7@gmail.com",
    gst: "23CZJPB0799P1ZV",
    stateCode: "23-Madhya Pradesh",
    bank: {
      name: "Manju Bakliwal",
      account: "616102010014589",
      ifsc: "UBIN0561614",
    },
    logo: "/images/cp_logo.png",
    textColor: "#31a7d7",
    tableHeader: [49, 167, 215], // CP blue
  }
};
