import { DEPARTMENT_KEYS, SECTIONS, STATUS_VALUES } from '../models/apiModel.js';

export function calculateCardBorderClass(vehicle) {
  const statuses = DEPARTMENT_KEYS.map(key => vehicle[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED);

  if (statuses.some(s => s === STATUS_VALUES.PENDING)) return 'status-pending-border';
  if (statuses.some(s => s === STATUS_VALUES.NOT_ATTENDED)) return 'status-not-attended-border';
  if (statuses.every(s => s === STATUS_VALUES.APPROVED)) return 'status-approved-border';
  return 'status-not-attended-border';
}

export function calculateProgress(vehicle) {
  let score = 0;
  DEPARTMENT_KEYS.forEach(key => {
    const s = vehicle[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED;
    if (s === STATUS_VALUES.APPROVED) score += 1;
    else if (s === STATUS_VALUES.PENDING) score += 0.5;
  });
  return Math.round((score / DEPARTMENT_KEYS.length) * 100);
}

export function getPendingDepartment(vehicle) {
  const workflowOrder = ['finance', 'tma', 'file', 'accounts', 'insurance', 'registration', 'tmga', 'pdi', 'delivery'];
  
  for (let key of workflowOrder) {
    if (vehicle[SECTIONS[key].statusField] === STATUS_VALUES.PENDING) {
      return { name: SECTIONS[key].title.replace(' Details', ''), status: STATUS_VALUES.PENDING };
    }
  }
  for (let key of workflowOrder) {
    if (vehicle[SECTIONS[key].statusField] === STATUS_VALUES.NOT_ATTENDED) {
      return { name: SECTIONS[key].title.replace(' Details', ''), status: STATUS_VALUES.NOT_ATTENDED };
    }
  }
  return { name: 'Completed', status: STATUS_VALUES.APPROVED };
}
