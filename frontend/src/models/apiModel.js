// KVR Tata Delivery Tracker - Data Layer (data.js)

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
      { name: 'vc', label: 'Vehicle Code (VC)', type: 'text', required: false }
    ]
  },
  sales: {
    title: 'Sales Details',
    fields: [
      { name: 'ca', label: 'Customer Advisor (CA)', type: 'text', required: true },
      { name: 'tl', label: 'Team Leader (TL)', type: 'text', required: true },
      { name: 'branch', label: 'Branch', type: 'select', options: ['Perinthalmanna'], required: true }
    ]
  },
  offer: {
    title: 'Offer Details',
    fields: [
      { name: 'hypothecation', label: 'Hypothecation (Bank/Self)', type: 'text', required: false },
      { name: 'cashDiscount', label: 'Cash Discount / Green Bonus (₹)', type: 'number', required: false, default: 0 },
      { name: 'exchangeLoyalty', label: 'Exchange / Loyalty (₹)', type: 'number', required: false, default: 0 },
      { name: 'corporate', label: 'Corporate Discount (₹)', type: 'number', required: false, default: 0 },
      { name: 'sss', label: 'SSS Discount (₹)', type: 'number', required: false, default: 0 },
      { name: 'kpkb', label: 'KPKB / Special Scheme (₹)', type: 'number', required: false, default: 0 },
      { name: 'solarOffer', label: 'Solar Offer (₹)', type: 'number', required: false, default: 0 },
      { name: 'priceDifference', label: 'Price Difference (₹)', type: 'number', required: false, default: 0 },
      { name: 'offerRemark', label: 'Offer Remark', type: 'text', required: false }
    ]
  },
  finance: {
    title: 'Finance Details',
    isDepartment: true,
    statusField: 'financeStatus',
    timestampField: 'financeTimestamp',
    fields: [
      { name: 'financeType', label: 'Finance Type', type: 'select', options: ['In-House', 'Outside Finance', 'Cash Booking'], required: true },
      { name: 'onRoadPrice', label: 'On Road Price (₹)', type: 'number', required: false, default: 0 },
      { name: 'ip', label: 'Initial Payment (IP) (₹)', type: 'number', required: false, default: 0 },
      { name: 'loanAmount', label: 'Loan Amount (₹)', type: 'number', required: false, default: 0 },
      { name: 'balanceAmount', label: 'Balance Amount (₹)', type: 'number', required: false, default: 0 },
      { name: 'fundPercentage', label: 'Fund Percentage (%)', type: 'number', required: false, default: 0 },
      { name: 'loanAmountStatus', label: 'Loan Amount Status', type: 'select', options: ['Awaiting Login', 'Logged In', 'Sanctioned', 'Disbursed', 'Not Applicable'], required: false },
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
      { name: 'exchangeYesNo', label: 'Exchange Applicable', type: 'select', options: ['No', 'Yes'], required: true },
      { name: 'tmaType', label: 'TMA Type', type: 'select', options: ['Tata Assured Trade-in', 'Local Broker Dealer', 'Self Direct', 'Not Applicable'], required: false },
      { name: 'makeAndModel', label: 'Old Vehicle Make & Model', type: 'text', required: false },
      { name: 'regNumber', label: 'Old Reg Number', type: 'text', required: false },
      { name: 'tmaRemark', label: 'TMA Valuation Remark', type: 'text', required: false },
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
      { name: 'fileStatus', label: 'Tally File Status', type: 'status', required: true },
      { name: 'fileTimestamp', label: 'Tally File Timestamp', type: 'timestamp', required: false }
    ]
  },
  accounts: {
    title: 'Accounts Details',
    isDepartment: true,
    statusField: 'accountsStatus',
    timestampField: 'accountsTimestamp',
    fields: [
      { name: 'accountsRemark', label: 'Accounts Remark', type: 'text', required: false },
      { name: 'tallyDate', label: 'Tally Voucher Date', type: 'date', required: false },
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
      { name: 'insuranceType', label: 'Insurance Type', type: 'select', options: ['In-House (Tata Motors)', 'Outside Broker', 'Corporate Multi-Year'], required: true },
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
      { name: 'registrationType', label: 'Registration Type', type: 'select', options: ['Temporary', 'Permanent', 'BH Series'], required: true },
      { name: 'applicationNumber', label: 'Application Number', type: 'text', required: false },
      { name: 'taxPaidDate', label: 'Tax Paid Date', type: 'date', required: false },
      { name: 'registerNumber', label: 'Reg Registration Number', type: 'text', required: false },
      { name: 'hsrpStatus', label: 'HSRP Status', type: 'select', options: ['Not Ordered', 'Ordered', 'Received', 'Fitted'], required: false },
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
      { name: 'tmgaValue', label: 'TMGA Value (₹)', type: 'number', required: false, default: 0 },
      { name: 'vasValue', label: 'VAS Value (₹)', type: 'number', required: false, default: 0 },
      { name: 'tmgaRemark', label: 'TMGA / VAS Remarks', type: 'text', required: false },
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

// All department status fields
export const DEPARTMENT_KEYS = [
  'finance', 'tma', 'file', 'accounts', 'insurance', 'registration', 'tmga', 'pdi', 'delivery'
];

export const STATUS_VALUES = {
  NOT_ATTENDED: 'Not Attended',
  PENDING: 'Pending',
  APPROVED: 'Approved'
};

// REST API Connectors for Vehicles
export async function getVehicles() {
  const res = await fetch('/api/vehicles');
  if (!res.ok) {
    throw new Error('Failed to retrieve vehicle data from backend');
  }
  return await res.json();
}

export async function saveVehicle(updatedVehicle, changedByRole, remarks = '') {
  const oldVehicles = await getVehicles();
  const oldVehicle = oldVehicles.find(v => v.chassisNumber === updatedVehicle.chassisNumber);
  
  const audits = [];
  if (oldVehicle) {
    Object.keys(SECTIONS).forEach(sectionKey => {
      const sec = SECTIONS[sectionKey];
      if (sec.isDepartment) {
        const statusField = sec.statusField;
        const oldVal = oldVehicle[statusField] || STATUS_VALUES.NOT_ATTENDED;
        const newVal = updatedVehicle[statusField] || STATUS_VALUES.NOT_ATTENDED;
        
        if (oldVal !== newVal) {
          audits.push({
            chassisNumber: updatedVehicle.chassisNumber,
            customerName: updatedVehicle.customerName,
            updatedBy: changedByRole,
            department: sec.title.replace(' Details', ''),
            previousStatus: oldVal,
            newStatus: newVal,
            remarks: remarks || `Status updated via ${changedByRole}`
          });
        }
      }
    });
  }

  const res = await fetch(`/api/vehicles/${updatedVehicle.chassisNumber}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Role': changedByRole,
      'X-Remarks': remarks
    },
    body: JSON.stringify(updatedVehicle)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to save vehicle details');
  }

  return audits;
}

export async function createVehicle(newVehicle, changedByRole) {
  const res = await fetch('/api/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Role': changedByRole
    },
    body: JSON.stringify(newVehicle)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to register new customer booking');
  }

  const created = await res.json();
  return {
    chassisNumber: created.chassisNumber,
    customerName: created.customerName,
    updatedBy: changedByRole,
    department: 'Customer Booking',
    previousStatus: 'None',
    newStatus: 'Booked',
    remarks: 'New Customer Booking created'
  };
}

export async function deleteVehicle(chassisNumber, changedByRole) {
  const res = await fetch(`/api/vehicles/${chassisNumber}`, {
    method: 'DELETE',
    headers: {
      'X-Role': changedByRole
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to remove booking record');
  }
}

export async function resetDatabase() {
  const res = await fetch('/api/reset', {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to run backend seed operation');
  }
  return await getVehicles();
}

// REST API Connectors for User Management & Login
export async function loginUser(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Login verification failed');
  }
  return await res.json();
}

export async function getUsers(activeRole) {
  const res = await fetch('/api/users', {
    headers: {
      'X-Role': activeRole
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to retrieve users');
  }
  return await res.json();
}

export async function createUser(userData, activeRole) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Role': activeRole
    },
    body: JSON.stringify(userData)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to register new employee account');
  }
  return await res.json();
}

export async function updateUser(username, userData, activeRole) {
  const res = await fetch(`/api/users/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Role': activeRole
    },
    body: JSON.stringify(userData)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update employee account details');
  }
  return await res.json();
}

export async function deleteUser(username, activeRole) {
  const res = await fetch(`/api/users/${username}`, {
    method: 'DELETE',
    headers: {
      'X-Role': activeRole
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to remove employee account');
  }
}
