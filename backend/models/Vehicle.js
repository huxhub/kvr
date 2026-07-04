import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // Customer Details
  date: { type: String },
  customerName: { type: String, required: true, trim: true },
  mobileNumber: { type: String },
  orderNumber: { type: String },
  invoiceNumber: { type: String },
  source: { type: String },
  year: { type: Number },

  // Vehicle Details
  vehicleStatus: { type: String },
  chassisNumber: { type: String, required: true, unique: true, trim: true },
  fuel: { type: String },
  pl: { type: String },
  variant: { type: String },
  colour: { type: String },
  vc: { type: String },

  // Sales Details
  ca: { type: String },
  tl: { type: String },
  branch: { type: String, default: 'Perinthalmanna' },

  // Offer Details
  hypothecation: { type: String },
  cashDiscount: { type: Number, default: 0 },
  exchangeLoyalty: { type: Number, default: 0 },
  corporate: { type: Number, default: 0 },
  sss: { type: Number, default: 0 },
  kpkb: { type: Number, default: 0 },
  solarOffer: { type: Number, default: 0 },
  priceDifference: { type: Number, default: 0 },
  offerRemark: { type: String },

  // Finance Details
  financeType: { type: String },
  onRoadPrice: { type: Number, default: 0 },
  ip: { type: Number, default: 0 },
  loanAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  fundPercentage: { type: Number, default: 0 },
  loanAmountStatus: { type: String },
  financeRemark: { type: String },
  financeStatus: { type: String, default: 'Not Attended' },
  financeTimestamp: { type: String },

  // TMA Details
  exchangeYesNo: { type: String },
  tmaType: { type: String },
  makeAndModel: { type: String },
  regNumber: { type: String },
  tmaRemark: { type: String },
  tmaStatus: { type: String, default: 'Not Attended' },
  tmaTimestamp: { type: String },

  // File Details
  fileStatus: { type: String, default: 'Not Attended' },
  fileTimestamp: { type: String },

  // Accounts Details
  tallyDate: { type: String },
  accountsRemark: { type: String },
  accountsStatus: { type: String, default: 'Not Attended' },
  accountsTimestamp: { type: String },

  // Insurance Details
  insuranceName: { type: String },
  insuranceType: { type: String },
  insurancePremium: { type: Number, default: 0 },
  insuranceRemark: { type: String },
  insuranceStatus: { type: String, default: 'Not Attended' },
  insuranceTimestamp: { type: String },

  // Registration Details
  registrationType: { type: String },
  applicationNumber: { type: String },
  taxPaidDate: { type: String },
  registerNumber: { type: String },
  hsrpStatus: { type: String },
  registrationRemark: { type: String },
  registrationStatus: { type: String, default: 'Not Attended' },
  registrationTimestamp: { type: String },

  // TMGA Details
  tmgaValue: { type: Number, default: 0 },
  vasValue: { type: Number, default: 0 },
  tmgaRemark: { type: String },
  tmgaStatus: { type: String, default: 'Not Attended' },
  tmgaTimestamp: { type: String },

  // PDI Details
  pdiRemark: { type: String },
  pdiStatus: { type: String, default: 'Not Attended' },
  pdiTimestamp: { type: String },

  // Delivery Details
  cxoRemark: { type: String },
  expectedDeliveryDate: { type: String },
  actualDeliveryDate: { type: String },
  homeVisit14DayStatus: { type: String },
  deliveryStatus: { type: String, default: 'Not Attended' },
  deliveryTimestamp: { type: String }

}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
