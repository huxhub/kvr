// Define fields and structure for the delivery_master table
export const SECTIONS = {
  customer: {
    title: 'Customer Details',
    fields: [
      { name: 'date', label: 'Booking Date', type: 'date', required: true },
      { name: 'customerName', label: 'Full Name', type: 'text', required: true },
      { name: 'mobileNumber', label: 'Mobile No', type: 'tel', required: true },
      { name: 'optyId', label: 'OPTY ID', type: 'text', required: false },
      { name: 'orderNumber', label: 'BKG ORDER NO', type: 'text', required: true },
      { name: 'sapOrderNo', label: 'SAP ORDER NO', type: 'text', required: false },
      { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: false },
      { name: 'source', label: 'Booking Source', type: 'select', options: ['Walk-in', 'Referral', 'Digital Ads', 'Social Media', 'Exchange Event', 'Co-operative Society'], required: false },
      { name: 'year', label: 'Manufacturing Year', type: 'number', required: true, default: 2026 }
    ]
  },
  vehicle: {
    title: 'Vehicle Details',
    fields: [
      { name: 'vehicleStatus', label: 'Vehicle Status', type: 'select', options: ['Booked', 'Allotted', 'In-Transit', 'PDI Hold', 'Ready for Delivery', 'Delivered', 'Cancelled'], required: true },
      { name: 'chassisNumber', label: 'Chassis Number', type: 'text', required: true },
      { name: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'EV'], required: true },
      { name: 'pl', label: 'PPL', type: 'select', options: ['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari'], required: true },
      { name: 'variant', label: 'PL (Variant)', type: 'text', required: true },
      { name: 'colour', label: 'Color', type: 'text', required: true },
      { name: 'boStatus', label: 'BO STATUS', type: 'select', options: ['BO DONE', 'BO PENDING', 'IN STOCK', 'No Stock'], required: false },
      { name: 'boDate', label: 'BO DATE', type: 'date', required: false },
      { name: 'vc', label: 'Vehicle Code (VC)', type: 'text', required: false }
    ]
  },
  sales: {
    title: 'Sales Details',
    fields: [
      { name: 'ca', label: 'Customer Advisor (CA)', type: 'text', required: true },
      { name: 'tl', label: 'Team Leader (TL)', type: 'text', required: true },
      { name: 'branch', label: 'Branch', type: 'select', options: [], required: true },
      { name: 'region', label: 'Region', type: 'select', options: ['R1', 'R2', 'TD'], required: false },
      { name: 'crmBookingStatus', label: 'CRM - Booking Status', type: 'select', options: ['CRM /RETAIL DONE', 'CRM REQUESTED/CHASSIS BLOCKED', 'CANCELLED WITHOUT DOCUMENT/REFUND', 'REFUND OK-CRM CANCELLATION PENDING'], required: false },
      { name: 'branchStatus', label: 'Branch Status', type: 'select', options: ['LIVE', 'NOT LIVE', 'CANCELLATION', 'MODEL CHANGE', 'NAME CHANGE'], required: false },
      { name: 'branchRemark', label: 'Branch Remark', type: 'text', required: false }
    ]
  },
  offer: {
    title: 'Offer Details',
    fields: [
      { name: 'hypothecation', label: 'Hypothecation (Bank/Self)', type: 'text', required: false },
      { name: 'cashDiscount', label: 'Cash Discount / Green Bonus (₹)', type: 'number', required: false },
      { name: 'exchangeLoyalty', label: 'Exchange / Loyalty (₹)', type: 'number', required: false },
      { name: 'corporate', label: 'Corporate Discount (₹)', type: 'number', required: false },
      { name: 'sss', label: 'SSS Discount (₹)', type: 'number', required: false },
      { name: 'kpkb', label: 'KPKB / Special Scheme (₹)', type: 'number', required: false },
      { name: 'solarOffer', label: 'Solar Offer (₹)', type: 'number', required: false },
      { name: 'priceDifference', label: 'Price Difference (₹)', type: 'number', required: false },
      { name: 'offerRemark', label: 'Offer Remark', type: 'text', required: false }
    ]
  },
  finance: {
    title: 'Finance Details',
    isDepartment: true,
    statusField: 'financeStatus',
    timestampField: 'financeTimestamp',
    fields: [
      { name: 'financeType', label: 'Finance Type', type: 'select', options: ['In-House', 'Outside Finance', 'Cash Booking', 'Self-Finance'], required: true },
      { name: 'onRoadPrice', label: 'On Road Price (₹)', type: 'number', required: false },
      { name: 'ip', label: 'Initial Payment (IP) (₹)', type: 'number', required: false },
      { name: 'loanAmount', label: 'Loan Amount (₹)', type: 'number', required: false },
      { name: 'balanceAmount', label: 'Balance Amount (₹)', type: 'number', required: false },
      { name: 'fundPercentage', label: 'Fund Percentage (%)', type: 'number', required: false },
      { name: 'loanAmountStatus', label: 'Loan Amount Status', type: 'select', options: ['Logged In', 'Sanctioned', 'Disbursed', 'Not Applicable'], required: false },
      { name: 'financeRemark', label: 'Finance Remark', type: 'text', required: false },
      { name: 'financeStatus', label: 'Finance Status', type: 'select', options: ['DOCUMENTS PENDING', 'LOAN APPROVED', 'CASH PURCHASE', 'CIBIL ISSUE'], required: true },
      { name: 'financeTimestamp', label: 'Finance Timestamp', type: 'timestamp', required: false }
    ]
  },
  tma: {
    title: 'TMA Details',
    isDepartment: true,
    statusField: 'tmaStatus',
    timestampField: 'tmaTimestamp',
    fields: [
      { name: 'exchangeYesNo', label: 'Exchange (Yes/No)', type: 'select', options: ['Yes', 'No'], required: true },
      { name: 'tmaType', label: 'TMA Type', type: 'text', required: false },
      { name: 'makeAndModel', label: 'Make and Model', type: 'text', required: false },
      { name: 'regNumber', label: 'Reg Number', type: 'text', required: false },
      { name: 'tmaRemark', label: 'TMA Remark', type: 'text', required: false },
      { name: 'tmaStatus', label: 'TMA Status', type: 'status', required: true },
      { name: 'tmaTimestamp', label: 'TMA Timestamp', type: 'timestamp', required: false }
    ]
  },
  file: {
    title: 'Tally File Details',
    isDepartment: true,
    statusField: 'fileStatus',
    timestampField: 'fileTimestamp',
    fields: [
      { name: 'fileStatus', label: 'Tally File Status', type: 'status', required: true },
      { name: 'fileTimestamp', label: 'File Timestamp', type: 'timestamp', required: false }
    ]
  },
  accounts: {
    title: 'Accounts Details',
    isDepartment: true,
    statusField: 'accountsStatus',
    timestampField: 'accountsTimestamp',
    fields: [
      { name: 'tallyDate', label: 'Tally Voucher Date', type: 'date', required: false },
      { name: 'accountsRemark', label: 'Accounts Remark', type: 'text', required: false },
      { name: 'accountsStatus', label: 'Accounts Status', type: 'status', required: true },
      { name: 'accountsTimestamp', label: 'Accounts Timestamp', type: 'timestamp', required: false }
    ]
  },
  insurance: {
    title: 'Insurance Details',
    isDepartment: true,
    statusField: 'insuranceStatus',
    timestampField: 'insuranceTimestamp',
    fields: [
      { name: 'insuranceType', label: 'Insurance Type', type: 'select', options: ['In-House (Tata Motors)', 'Outside Broker'], required: true },
      { name: 'insuranceRemark', label: 'Insurance Remark', type: 'text', required: false },
      { name: 'insuranceStatus', label: 'Insurance Status', type: 'status', required: true },
      { name: 'insuranceTimestamp', label: 'Insurance Timestamp', type: 'timestamp', required: false }
    ]
  },
  registration: {
    title: 'Registration Details',
    isDepartment: true,
    statusField: 'registrationStatus',
    timestampField: 'registrationTimestamp',
    fields: [
      { name: 'registrationType', label: 'Registration Type', type: 'select', options: ['Temporary', 'Permanent', 'Outside'], required: true },
      { name: 'applicationNumber', label: 'Application Number', type: 'text', required: false },
      { name: 'taxPaidDate', label: 'Tax Paid Date', type: 'date', required: false },
      { name: 'registerNumber', label: 'Registration Number', type: 'text', required: false },
      { name: 'hsrpStatus', label: 'HSRP Status', type: 'select', options: ['Not Ordered', 'Ordered', 'Fitted'], required: false },
      { name: 'registrationRemark', label: 'Registration Remark', type: 'text', required: false },
      { name: 'registrationStatus', label: 'Registration Status', type: 'status', required: true },
      { name: 'registrationTimestamp', label: 'Registration Timestamp', type: 'timestamp', required: false }
    ]
  },
  tmga: {
    title: 'TMGA Details',
    isDepartment: true,
    statusField: 'tmgaStatus',
    timestampField: 'tmgaTimestamp',
    fields: [
      { name: 'tmgaValue', label: 'TMGA Value (₹)', type: 'number', required: false },
      { name: 'vasValue', label: 'VAS Value (₹)', type: 'number', required: false },
      { name: 'tmgaRemark', label: 'TMGA Remark', type: 'text', required: false },
      { name: 'tmgaStatus', label: 'TMGA Status', type: 'status', required: true },
      { name: 'tmgaTimestamp', label: 'TMGA Timestamp', type: 'timestamp', required: false }
    ]
  },
  pdi: {
    title: 'PDI Details',
    isDepartment: true,
    statusField: 'pdiStatus',
    timestampField: 'pdiTimestamp',
    fields: [
      { name: 'pdiRemark', label: 'PDI Assessment Remark', type: 'text', required: false },
      { name: 'pdiStatus', label: 'PDI Status', type: 'status', required: true },
      { name: 'pdiTimestamp', label: 'PDI Timestamp', type: 'timestamp', required: false }
    ]
  },
  delivery: {
    title: 'Delivery Details',
    isDepartment: true,
    statusField: 'deliveryStatus',
    timestampField: 'deliveryTimestamp',
    fields: [
      { name: 'cxoRemark', label: 'CXO Delivery Remark', type: 'text', required: false },
      { name: 'expectedDeliveryDate', label: 'Expected Delivery Date', type: 'date', required: false },
      { name: 'actualDeliveryDate', label: 'Actual Delivery Date', type: 'date', required: false },
      { name: 'homeVisit14DayStatus', label: '14 Day Home Visit Status', type: 'select', options: ['Not Attended', 'Pending Schedule', 'Completed', 'Cancelled'], required: false },
      { name: 'deliveryStatus', label: 'Delivery Status', type: 'status', required: true },
      { name: 'deliveryTimestamp', label: 'Delivery Timestamp', type: 'timestamp', required: false }
    ]
  }
};

export const DEPARTMENT_KEYS = [
  'finance', 'tma', 'file', 'accounts', 'insurance', 'registration', 'tmga', 'pdi', 'delivery'
];

export const STATUS_VALUES = {
  NOT_ATTENDED: 'Not Attended',
  PENDING: 'Pending',
  APPROVED: 'Approved'
};
