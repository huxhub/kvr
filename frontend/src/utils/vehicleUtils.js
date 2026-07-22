import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES } from '../models/apiModel.js';

export function isStatusApproved(status) {
  if (!status) return false;
  const s = status.toString().trim().toUpperCase();
  return (
    s === 'APPROVED' ||
    s === 'LOAN APPROVED' ||
    s === 'CASH PURCHASE' ||
    s === 'COMPLETED' ||
    s.includes('APPROVED') ||
    s.includes('DONE')
  );
}

export function isStatusPending(status) {
  if (!status) return false;
  const s = status.toString().trim().toUpperCase();
  return (
    s === 'PENDING' ||
    s === 'DOCUMENTS PENDING' ||
    s.includes('PENDING') ||
    s.includes('REQUESTED')
  );
}

export function calculateCardBorderClass(vehicle) {
  const statuses = DEPARTMENT_KEYS.map(key => vehicle[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED);

  if (statuses.every(s => isStatusApproved(s))) return 'status-approved-border';
  if (statuses.some(s => isStatusPending(s))) return 'status-pending-border';
  return 'status-not-attended-border';
}

export function calculateProgress(vehicle) {
  let score = 0;
  DEPARTMENT_KEYS.forEach(key => {
    const s = vehicle[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED;
    if (isStatusApproved(s)) {
      score += 1;
    } else if (isStatusPending(s)) {
      score += 0.5;
    }
  });
  return Math.round((score / DEPARTMENT_KEYS.length) * 100);
}

export function getPendingDepartment(vehicle) {
  const workflowOrder = ['finance', 'tma', 'file', 'accounts', 'insurance', 'registration', 'tmga', 'pdi', 'delivery'];
  
  for (let key of workflowOrder) {
    const s = vehicle[SECTIONS[key].statusField];
    if (isStatusPending(s)) {
      return { name: SECTIONS[key].title.replace(' Details', ''), status: s || STATUS_VALUES.PENDING };
    }
  }
  for (let key of workflowOrder) {
    const s = vehicle[SECTIONS[key].statusField];
    if (!isStatusApproved(s)) {
      return { name: SECTIONS[key].title.replace(' Details', ''), status: s || STATUS_VALUES.NOT_ATTENDED };
    }
  }
  return { name: 'Completed', status: STATUS_VALUES.APPROVED };
}

export function calculateFinanceFields(formData, fieldName) {
  if (fieldName === 'onRoadPrice' || fieldName === 'ip' || fieldName === 'loanAmount') {
    const updated = { ...formData };
    const onRoad = Number(updated.onRoadPrice) || 0;
    const ip = Number(updated.ip) || 0;
    const loan = Number(updated.loanAmount) || 0;

    updated.balanceAmount = onRoad - (ip + loan);

    if (onRoad > 0) {
      updated.fundPercentage = parseFloat((((ip + loan) / onRoad) * 100).toFixed(2));
    } else {
      updated.fundPercentage = 0;
    }
    return updated;
  }
  return formData;
}

