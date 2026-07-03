// Define fields and structure for the delivery_master table
export const SECTIONS = {
  customer: {
    title: 'Customer Details',
    fields: [
      { name: 'date', label: 'Booking Date', type: 'date', required: true },
      { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
      { name: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'orderNumber', label: 'Order Number', type: 'text', required: true },
      { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: false },
      { name: 'source', label: 'Booking Source', type: 'select', options: ['Walk-in', 'Referral', 'Digital Ads', 'Social Media', 'Exchange Event', 'Co-operative Society'], required: false },
      { name: 'year', label: 'Manufacturing Year', type: 'number', required: true, default: 2026 }
    ]
  },
  vehicle: {
    title: 'Vehicle Details',
    fields: [
      { name: 'vehicleStatus', label: 'Vehicle Status', type: 'select', options: ['Booked', 'Allotted', 'In-Transit', 'PDI Hold', 'Ready for Delivery', 'Delivered', 'Cancelled'], required: true },
      { name: 'chassisNumber', label: 'Chassis Number', type: 'text', required: true }, // Primary Key
      { name: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'EV'], required: true },
      { name: 'pl', label: 'Product Line (PL)', type: 'select', options: ['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari'], required: true },
      { name: 'variant', label: 'Variant', type: 'text', required: true },
      { name: 'colour', label: 'Colour', type: 'text', required: true },
      { name: 'ca', label: 'Customer Advisor (CA)', type: 'text', required: true },
      { name: 'tl', label: 'Team Leader (TL)', type: 'text', required: true },
      { name: 'branch', label: 'Sales Branch', type: 'text', required: false },
      { name: 'corporateDsa', label: 'Corporate DSA', type: 'text', required: false },
      { name: 'broker', label: 'Broker', type: 'text', required: false }
    ]
  },
  finance: {
    title: 'Finance Details',
    isDepartment: true,
    statusField: 'financeStatus',
    timestampField: 'financeTimestamp',
    fields: [
      { name: 'hypothecation', label: 'Hypothecation', type: 'text', required: false },
      { name: 'financierName', label: 'Financier Name', type: 'text', required: false },
      { name: 'doAmount', label: 'DO Amount', type: 'number', required: false },
      { name: 'doDate', label: 'DO Date', type: 'date', required: false },
      { name: 'financeRemark', label: 'Finance Remark', type: 'text', required: false },
      { name: 'financeStatus', label: 'Finance Status', type: 'status', required: true },
      { name: 'financeTimestamp', label: 'Finance Timestamp', type: 'timestamp', required: false }
    ]
  },
  tma: {
    title: 'TMA Details',
    isDepartment: true,
    statusField: 'tmaStatus',
    timestampField: 'tmaTimestamp',
    fields: [
      { name: 'oldCarMake', label: 'Old Car Make/Model', type: 'text', required: false },
      { name: 'oldCarRc', label: 'Old Car RC Number', type: 'text', required: false },
      { name: 'exchangeValue', label: 'Exchange Value', type: 'number', required: false },
      { name: 'tmaRemark', label: 'TMA Remark', type: 'text', required: false },
      { name: 'tmaStatus', label: 'TMA Status', type: 'status', required: true },
      { name: 'tmaTimestamp', label: 'TMA Timestamp', type: 'timestamp', required: false }
    ]
  },
  file: {
    title: 'File Details',
    isDepartment: true,
    statusField: 'fileStatus',
    timestampField: 'fileTimestamp',
    fields: [
      { name: 'kycStatus', label: 'KYC Documents Status', type: 'select', options: ['Pending', 'Received', 'Verified'], required: false },
      { name: 'nomineeDetails', label: 'Nominee Details', type: 'text', required: false },
      { name: 'fileRemark', label: 'File Checking Remark', type: 'text', required: false },
      { name: 'fileStatus', label: 'File Status', type: 'status', required: true },
      { name: 'fileTimestamp', label: 'File Timestamp', type: 'timestamp', required: false }
    ]
  },
  accounts: {
    title: 'Accounts Details',
    isDepartment: true,
    statusField: 'accountsStatus',
    timestampField: 'accountsTimestamp',
    fields: [
      { name: 'receiptNumber', label: 'Receipt Number(s)', type: 'text', required: false },
      { name: 'marginMoneyReceived', label: 'Margin Money Received', type: 'number', required: false },
      { name: 'amountPending', label: 'Amount Pending', type: 'number', required: false },
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
      { name: 'insuranceProvider', label: 'Insurance Provider', type: 'text', required: false },
      { name: 'policyNumber', label: 'Policy Number', type: 'text', required: false },
      { name: 'insuranceAmount', label: 'Insurance Amount', type: 'number', required: false },
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
      { name: 'rtoName', label: 'RTO Office Name', type: 'text', required: false },
      { name: 'temporaryRegistration', label: 'Temp Registration No.', type: 'text', required: false },
      { name: 'permanentRegistration', label: 'Permanent Registration No.', type: 'text', required: false },
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
      { name: 'accessoriesFitted', label: 'Accessories Fitted', type: 'text', required: false },
      { name: 'extendedWarranty', label: 'Extended Warranty Opted', type: 'select', options: ['Yes', 'No'], required: false },
      { name: 'amcOpted', label: 'AMC Opted', type: 'select', options: ['Yes', 'No'], required: false },
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
