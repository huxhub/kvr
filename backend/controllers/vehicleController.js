import * as Vehicle from '../models/Vehicle.js';
import * as Audit from '../models/Audit.js';

// Maps each vehicle field to the department it belongs to (for audit labelling)
const FIELD_DEPARTMENT_MAP = {
  // Customer / Booking
  date: 'Customer Booking', customerName: 'Customer Booking', mobileNumber: 'Customer Booking',
  optyId: 'Customer Booking', orderNumber: 'Customer Booking', sapOrderNo: 'Customer Booking',
  invoiceNumber: 'Customer Booking', source: 'Customer Booking', year: 'Customer Booking',
  // Vehicle
  vehicleStatus: 'Vehicle', chassisNumber: 'Vehicle', fuel: 'Vehicle',
  pl: 'Vehicle', variant: 'Vehicle', colour: 'Vehicle', boStatus: 'Vehicle', boDate: 'Vehicle', vc: 'Vehicle',
  // Sales
  ca: 'Sales', tl: 'Sales', branch: 'Sales', region: 'Sales',
  crmBookingStatus: 'Sales', branchStatus: 'Sales', branchRemark: 'Sales',
  // Offer
  hypothecation: 'Offer', cashDiscount: 'Offer', exchangeLoyalty: 'Offer',
  corporate: 'Offer', sss: 'Offer', kpkb: 'Offer', solarOffer: 'Offer',
  priceDifference: 'Offer', offerRemark: 'Offer',
  // Finance
  financeType: 'Finance', onRoadPrice: 'Finance', ip: 'Finance',
  loanAmount: 'Finance', balanceAmount: 'Finance', fundPercentage: 'Finance',
  loanAmountStatus: 'Finance', financeRemark: 'Finance',
  financeStatus: 'Finance', financeTimestamp: 'Finance',
  // TMA
  exchangeYesNo: 'TMA', tmaType: 'TMA', makeAndModel: 'TMA',
  regNumber: 'TMA', tmaRemark: 'TMA', tmaStatus: 'TMA', tmaTimestamp: 'TMA',
  // Tally File
  fileStatus: 'Tally File', fileTimestamp: 'Tally File',
  // Accounts
  tallyDate: 'Accounts', accountsRemark: 'Accounts',
  accountsStatus: 'Accounts', accountsTimestamp: 'Accounts',
  // Insurance
  insuranceType: 'Insurance', insuranceRemark: 'Insurance',
  insuranceStatus: 'Insurance', insuranceTimestamp: 'Insurance',
  // Registration
  registrationType: 'Registration', applicationNumber: 'Registration', taxPaidDate: 'Registration',
  registerNumber: 'Registration', hsrpStatus: 'Registration',
  registrationRemark: 'Registration', registrationStatus: 'Registration', registrationTimestamp: 'Registration',
  // TMGA
  tmgaValue: 'TMGA', vasValue: 'TMGA', tmgaRemark: 'TMGA',
  tmgaStatus: 'TMGA', tmgaTimestamp: 'TMGA',
  // PDI
  pdiRemark: 'PDI', pdiStatus: 'PDI', pdiTimestamp: 'PDI',
  // Delivery
  cxoRemark: 'Delivery', expectedDeliveryDate: 'Delivery', actualDeliveryDate: 'Delivery',
  homeVisit14DayStatus: 'Delivery', deliveryStatus: 'Delivery', deliveryTimestamp: 'Delivery',
};

export const getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    
    // Enforce strict limit <= 25
    const activeLimit = Math.min(25, Math.max(1, limit));

    const sessionUser = req.session.user;
    const isBranchRestricted = 
      (sessionUser?.role === 'BRANCH_MANAGER' || sessionUser?.role === 'FINANCE' || sessionUser?.role === 'TMA' || sessionUser?.role === 'ACCOUNTS' || sessionUser?.role === 'INSURANCE' || sessionUser?.role === 'REGISTRATION') && 
      sessionUser?.branch && 
      sessionUser?.branch !== 'All Branches';
    const userBranch = sessionUser?.branch;

    let vehicles, totalCount;

    if (isBranchRestricted) {
      // BRANCH_MANAGER or FINANCE: only see their own branch's vehicles
      [vehicles, totalCount] = await Promise.all([
        Vehicle.findByBranch(userBranch, page, activeLimit),
        Vehicle.countByBranch(userBranch)
      ]);
    } else {
      // ADMIN, CRM, etc.: see all vehicles
      [vehicles, totalCount] = await Promise.all([
        Vehicle.findAll(page, activeLimit),
        Vehicle.countAll()
      ]);
    }

    // Expose headers for cross-origin or local clients
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Limit');
    res.setHeader('X-Total-Count', totalCount.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', activeLimit.toString());

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const saved = await Vehicle.create(req.body);
    res.status(201).json(saved);
  } catch (error) {
    // MySQL ER_DUP_ENTRY error code for unique chassisNumber
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Chassis Number already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params; // id = chassisNumber
    const changedByRole = req.headers['x-role'] || 'UNKNOWN';
    const remarks = req.headers['x-remarks'] || '';

    // Fetch the existing vehicle BEFORE updating so we can diff changes
    const oldVehicle = await Vehicle.findByChassis(id);
    if (!oldVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updated = await Vehicle.updateByChassis(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found or no changes' });
    }

    // Diff: find every field that actually changed value
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const auditEntries = [];

    for (const field of Object.keys(req.body)) {
      const oldVal = oldVehicle[field];
      const newVal = req.body[field];

      // Skip unchanged fields and internal keys
      if (String(oldVal ?? '') === String(newVal ?? '')) continue;
      if (field === 'chassisNumber') continue;

      const dept = FIELD_DEPARTMENT_MAP[field] || 'General';

      auditEntries.push({
        chassisNumber: id,
        customerName: oldVehicle.customerName || updated.customerName || '',
        updatedBy: changedByRole,
        department: `${dept} — ${field}`,
        previousStatus: String(oldVal ?? ''),
        newStatus: String(newVal ?? ''),
        remarks: remarks || `${field} updated`,
        timestamp: now,
      });
    }

    // Write all audit entries to DB in one batch
    if (auditEntries.length > 0) {
      await Audit.insertMany(auditEntries);
    }

    res.json({ updated, auditEntries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Vehicle.deleteByChassis(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
