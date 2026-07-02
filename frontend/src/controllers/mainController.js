import { 
  SECTIONS, 
  DEPARTMENT_KEYS, 
  STATUS_VALUES, 
  getVehicles, 
  saveVehicle, 
  createVehicle, 
  deleteVehicle, 
  resetDatabase,
  loginUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../models/apiModel.js';
import { 
  getAuditLogs, 
  addAuditLog 
} from '../models/auditModel.js';

export function initApp() {
// KVR Tata Delivery Tracker - Application Logic (app.js)




// Application State
const state = {
  currentUser: null, // Authenticated user session { username, role, name, branch }
  activeTab: 'dashboard-view',
  vehicles: [],
  selectedVehicle: null, // Vehicle being edited (null for new booking)
  viewMode: 'grid', // grid or list
  filters: {
    global: '',
    branch: 'Perinthalmanna', // Locked branch
    status: '',
    ca: '',
    tl: '',
    expDate: '',
    actDate: '',
    financeStatus: '',
    tmaStatus: '',
    accountsStatus: '',
    registrationStatus: '',
    pdiStatus: ''
  }
};

// Role Access Settings for forms
const ROLE_PERMISSIONS = {
  ADMIN: { canCreate: true, canDelete: true, editableSections: ['customer', 'vehicle', 'sales', 'offer', 'finance', 'tma', 'file', 'accounts', 'insurance', 'registration', 'tmga', 'pdi', 'delivery'] },
  CRM: { canCreate: true, canDelete: false, editableSections: ['customer', 'vehicle', 'sales', 'offer'] },
  FINANCE: { canCreate: false, canDelete: false, editableSections: ['finance'] },
  TMA: { canCreate: false, canDelete: false, editableSections: ['tma'] },
  ACCOUNTS: { canCreate: false, canDelete: false, editableSections: ['accounts', 'file'] },
  INSURANCE: { canCreate: false, canDelete: false, editableSections: ['insurance'] },
  REGISTRATION: { canCreate: false, canDelete: false, editableSections: ['registration'] },
  TMGA: { canCreate: false, canDelete: false, editableSections: ['tmga'] },
  PDI: { canCreate: false, canDelete: false, editableSections: ['pdi'] },
  DELIVERY: { canCreate: false, canDelete: false, editableSections: ['delivery'] },
  MANAGEMENT: { canCreate: false, canDelete: false, editableSections: [] } // View only
};

// Current Simulated Date
const SIMULATED_TODAY = '2026-06-22';

// DOM Elements
const elements = {
  // Login Panel
  loginOverlay: document.getElementById('login-overlay'),
  loginForm: document.getElementById('login-form'),
  loginUsername: document.getElementById('inp-login-username'),
  loginPassword: document.getElementById('inp-login-password'),
  loginError: document.getElementById('login-error'),
  
  // Header
  appHeader: document.getElementById('app-header'),
  appNav: document.getElementById('app-nav'),
  appMain: document.getElementById('app-main'),
  lblUserName: document.getElementById('lbl-user-name'),
  lblUserRole: document.getElementById('lbl-user-role'),
  btnLogout: document.getElementById('btn-logout'),

  // Tabs
  tabs: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  tabUsers: document.getElementById('tab-users'),
  
  // KPIs
  kpiTotalBookings: document.getElementById('kpi-total-bookings'),
  kpiDeliveredToday: document.getElementById('kpi-delivered-today'),
  kpiDeliveredMonth: document.getElementById('kpi-delivered-month'),
  kpiReadyDelivery: document.getElementById('kpi-ready-delivery'),
  
  // Bottlenecks
  btnFinP: document.getElementById('bottleneck-fin-p'),
  btnFinN: document.getElementById('bottleneck-fin-n'),
  btnTmaP: document.getElementById('bottleneck-tma-p'),
  btnTmaN: document.getElementById('bottleneck-tma-n'),
  btnFileP: document.getElementById('bottleneck-file-p'),
  btnFileN: document.getElementById('bottleneck-file-n'),
  btnAccP: document.getElementById('bottleneck-acc-p'),
  btnAccN: document.getElementById('bottleneck-acc-n'),
  btnInsP: document.getElementById('bottleneck-ins-p'),
  btnInsN: document.getElementById('bottleneck-ins-n'),
  btnRegP: document.getElementById('bottleneck-reg-p'),
  btnRegN: document.getElementById('bottleneck-reg-n'),
  btnTmgaP: document.getElementById('bottleneck-tmga-p'),
  btnTmgaN: document.getElementById('bottleneck-tmga-n'),
  btnPdiP: document.getElementById('bottleneck-pdi-p'),
  btnPdiN: document.getElementById('bottleneck-pdi-n'),
  
  // Filters
  filterGlobal: document.getElementById('filter-global'),
  filterBranch: document.getElementById('filter-branch'),
  filterStatus: document.getElementById('filter-status'),
  filterCa: document.getElementById('filter-ca'),
  filterTl: document.getElementById('filter-tl'),
  filterExpDate: document.getElementById('filter-exp-date'),
  filterActDate: document.getElementById('filter-act-date'),
  filterFinStatus: document.getElementById('filter-fin-status'),
  filterTmaStatus: document.getElementById('filter-tma-status'),
  filterAccStatus: document.getElementById('filter-acc-status'),
  filterRegStatus: document.getElementById('filter-reg-status'),
  filterPdiStatus: document.getElementById('filter-pdi-status'),
  btnClearFilters: document.getElementById('btn-clear-filters'),
  
  // Lists & Layouts
  gridContainer: document.getElementById('grid-container'),
  listContainer: document.getElementById('list-container'),
  tableBody: document.getElementById('table-body'),
  lblResultCount: document.getElementById('lbl-result-count'),
  lblTotalCount: document.getElementById('lbl-total-count'),
  btnViewGrid: document.getElementById('btn-view-grid'),
  btnViewList: document.getElementById('btn-view-list'),
  btnAddVehicle: document.getElementById('btn-add-vehicle'),
  
  // Drawer/Modal
  drawerOverlay: document.getElementById('vehicle-drawer-overlay'),
  drawerTitle: document.getElementById('drawer-title'),
  drawerSubtitle: document.getElementById('drawer-subtitle'),
  vehicleForm: document.getElementById('vehicle-form'),
  inpAuditRemark: document.getElementById('inp-audit-remark'),
  btnSaveDrawer: document.getElementById('btn-save-drawer'),
  btnCancelDrawer: document.getElementById('btn-cancel-drawer'),
  btnDeleteVehicle: document.getElementById('btn-delete-vehicle'),
  btnCloseDrawer: document.getElementById('btn-close-drawer'),
  
  // Audit Screen
  searchAudit: document.getElementById('search-audit'),
  auditTableBody: document.getElementById('audit-table-body'),
  btnClearAudits: document.getElementById('btn-clear-audits'),
  
  // User Management Admin Tab Controls
  usersTableBody: document.getElementById('users-table-body'),
  userFormTitle: document.getElementById('user-form-title'),
  userAdminForm: document.getElementById('user-admin-form'),
  inpUserEditMode: document.getElementById('inp-user-edit-mode'),
  inpUserUsername: document.getElementById('inp-user-username'),
  inpUserPassword: document.getElementById('inp-user-password'),
  inpUserName: document.getElementById('inp-user-name'),
  inpUserRole: document.getElementById('inp-user-role'),
  btnUserCancel: document.getElementById('btn-user-cancel'),
  
  // General Controls
  btnResetDb: document.getElementById('btn-reset-db'),
  toastContainer: document.getElementById('toast-container')
};

// Initialize — called by React after DOM is injected
checkActiveSession();


// Check Session Helper
function checkActiveSession() {
  const cachedUser = sessionStorage.getItem('kvr_user');
  if (cachedUser) {
    state.currentUser = JSON.parse(cachedUser);
    setupAuthenticatedState();
  } else {
    // Show Login view, bind forms
    elements.loginOverlay.style.display = 'flex';
    elements.appHeader.style.display = 'none';
    elements.appNav.style.display = 'none';
    elements.appMain.style.display = 'none';
    
    // Unbind / Re-bind Login Handler
    elements.loginForm.onsubmit = handleLoginSubmit;
  }
}

// Login Handler
async function handleLoginSubmit(e) {
  e.preventDefault();
  elements.loginError.style.display = 'none';
  
  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value.trim();
  
  try {
    const userData = await loginUser(username, password);
    sessionStorage.setItem('kvr_user', JSON.stringify(userData));
    state.currentUser = userData;
    
    setupAuthenticatedState();
    showToast('Success', `Signed in as ${state.currentUser.name} (${state.currentUser.role})`, 'success');
  } catch (error) {
    elements.loginError.textContent = error.message;
    elements.loginError.style.display = 'block';
    
    // Add temporary shake animation for visual feedback
    const card = elements.loginOverlay.querySelector('.modal-drawer');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
  }
}

// Boot up dashboard assets on validation success
function setupAuthenticatedState() {
  elements.loginOverlay.style.display = 'none';
  elements.appHeader.style.display = 'flex';
  elements.appNav.style.display = 'flex';
  elements.appMain.style.display = 'block';
  
  // Populate profile fields
  elements.lblUserName.textContent = state.currentUser.name;
  elements.lblUserRole.textContent = state.currentUser.role;
  
  // Hide/Show Admin Tabs
  if (state.currentUser.role === 'ADMIN') {
    elements.tabUsers.style.display = 'flex';
    const resetPanel = document.getElementById('admin-reset-panel');
    if (resetPanel) resetPanel.style.display = 'flex';
  } else {
    elements.tabUsers.style.display = 'none';
    const resetPanel = document.getElementById('admin-reset-panel');
    if (resetPanel) resetPanel.style.display = 'none';
  }
  
  // Bind Logout
  elements.btnLogout.onclick = () => {
    sessionStorage.removeItem('kvr_user');
    location.reload(); // Refresh memory states completely
  };

  // Run app initializations
  initDashboard();
}

async function initDashboard() {
  try {
    // Load database
    state.vehicles = await getVehicles();
    
    // Populates filter Advisor lists (CAs and TLs from loaded data)
    populateFiltersDropdowns();
    
    // Set up listeners
    bindEvents();
    
    // Apply role lockouts on form details
    updateRoleAccessUI();
    
    // Render views
    renderKPIs();
    renderVehicles();
    await renderAuditLogs();
    
    // Load Users List if role is admin
    if (state.currentUser.role === 'ADMIN') {
      await renderUsersList();
    }
  } catch (error) {
    showToast('Connection Error', 'Could not establish connection to the backend database.', 'error');
    console.error(error);
  }
}

// Event Bindings
function bindEvents() {
  // Tab Navigation
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.tabs.forEach(t => t.classList.remove('active'));
      elements.tabContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
      
      state.activeTab = targetId;
      if (targetId === 'audit-view') {
        renderAuditLogs();
      } else if (targetId === 'users-view') {
        renderUsersList();
      }
    });
  });

  // Search and Filters
  const filterInputs = [
    elements.filterGlobal, elements.filterStatus,
    elements.filterCa, elements.filterTl, elements.filterExpDate,
    elements.filterActDate, elements.filterFinStatus, elements.filterTmaStatus,
    elements.filterAccStatus, elements.filterRegStatus, elements.filterPdiStatus
  ];
  
  filterInputs.forEach(input => {
    if (input) {
      input.oninput = handleFilterChange;
      input.onchange = handleFilterChange;
    }
  });

  elements.btnClearFilters.onclick = () => {
    filterInputs.forEach(input => {
      if (input) input.value = '';
    });
    // Reset state filters (except locked branch)
    Object.keys(state.filters).forEach(k => {
      if (k !== 'branch') state.filters[k] = '';
    });
    renderVehicles();
  };

  // View Mode Toggles
  elements.btnViewGrid.onclick = () => {
    state.viewMode = 'grid';
    elements.btnViewGrid.classList.add('active');
    elements.btnViewList.classList.remove('active');
    elements.gridContainer.style.display = 'grid';
    elements.listContainer.style.display = 'none';
  };

  elements.btnViewList.onclick = () => {
    state.viewMode = 'list';
    elements.btnViewList.classList.add('active');
    elements.btnViewGrid.classList.remove('active');
    elements.listContainer.style.display = 'block';
    elements.gridContainer.style.display = 'none';
  };

  // Add Vehicle Event
  elements.btnAddVehicle.onclick = () => {
    openDrawer(null); // Open drawer for new booking
  };

  // Drawer Controls
  elements.btnCancelDrawer.onclick = closeDrawer;
  elements.btnCloseDrawer.onclick = closeDrawer;
  elements.btnDeleteVehicle.onclick = handleDeleteVehicle;
  elements.vehicleForm.onsubmit = handleFormSubmit;

  // Quick Status updates click bindings (One-click update)
  Object.keys(SECTIONS).forEach(secKey => {
    const sec = SECTIONS[secKey];
    if (sec.isDepartment) {
      const btnGroup = document.getElementById(`quick-status-${secKey}`);
      if (btnGroup) {
        btnGroup.querySelectorAll('.quick-status-btn').forEach(btn => {
          btn.onclick = () => {
            // Check if section is editable under current role
            const permissions = ROLE_PERMISSIONS[state.currentUser.role];
            if (!permissions.editableSections.includes(secKey)) return; // Locked

            const newVal = btn.getAttribute('data-value');
            const hiddenInp = document.getElementById(`inp-${secKey}-${sec.statusField}`);
            
            // Set hidden field value
            hiddenInp.value = newVal;
            
            // Update active states
            btnGroup.querySelectorAll('.quick-status-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update timestamp input visually
            const tsInp = document.getElementById(`inp-${secKey}-${sec.timestampField}`);
            if (tsInp) {
              const now = new Date();
              tsInp.value = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
            }
          };
        });
      }
    }
  });

  // DB Resets (Admin Only)
  if (elements.btnResetDb) {
    elements.btnResetDb.onclick = async () => {
      if (confirm('Are you sure you want to reset the database? All custom vehicle records, logins, and audit logs will be overwritten.')) {
        try {
          state.vehicles = await resetDatabase();
          populateFiltersDropdowns();
          renderKPIs();
          renderVehicles();
          await renderAuditLogs();
          if (state.currentUser.role === 'ADMIN') {
            await renderUsersList();
          }
          showToast('Database Reset', 'System database restored to demo state.', 'success');
        } catch (error) {
          showToast('Reset Failed', error.message, 'error');
        }
      }
    };
  }

  // Global Audit Search Filter
  elements.searchAudit.oninput = (e) => {
    renderAuditLogs(e.target.value);
  };

  elements.btnClearAudits.onclick = async () => {
    if (confirm('Clear all audit logs from storage? This action cannot be undone.')) {
      try {
        await fetch('/api/audit-logs', { method: 'DELETE' });
        await renderAuditLogs();
        showToast('Audits Cleared', 'Audit trail has been reset.', 'info');
      } catch (error) {
        showToast('Clear Failed', error.message, 'error');
      }
    }
  };

  // User Management Admin Forms
  elements.userAdminForm.onsubmit = handleUserFormSubmit;
  elements.btnUserCancel.onclick = resetUserAdminForm;
}

// Populate CAs and TLs lists dynamically from data
function populateFiltersDropdowns() {
  const cas = new Set();
  const tls = new Set();
  
  state.vehicles.forEach(v => {
    if (v.ca) cas.add(v.ca);
    if (v.tl) tls.add(v.tl);
  });

  const originalCaVal = elements.filterCa.value;
  const originalTlVal = elements.filterTl.value;
  
  elements.filterCa.innerHTML = '<option value="">All CAs</option>';
  elements.filterTl.innerHTML = '<option value="">All TLs</option>';
  
  Array.from(cas).sort().forEach(ca => {
    elements.filterCa.innerHTML += `<option value="${ca}">${ca}</option>`;
  });
  
  Array.from(tls).sort().forEach(tl => {
    elements.filterTl.innerHTML += `<option value="${tl}">${tl}</option>`;
  });
  
  elements.filterCa.value = originalCaVal;
  elements.filterTl.value = originalTlVal;
}

// Role Restrictions Engine
function updateRoleAccessUI() {
  const permissions = ROLE_PERMISSIONS[state.currentUser.role];
  
  // Show / Hide Add Vehicle based on role limits
  if (permissions.canCreate) {
    elements.btnAddVehicle.style.display = 'flex';
  } else {
    elements.btnAddVehicle.style.display = 'none';
  }
}

// Render Dashboard KPIs
function renderKPIs() {
  const vehicles = state.vehicles;
  
  // KPI Metrics Calculation
  elements.kpiTotalBookings.textContent = vehicles.length;
  
  const deliveredToday = vehicles.filter(v => v.actualDeliveryDate === SIMULATED_TODAY).length;
  elements.kpiDeliveredToday.textContent = deliveredToday;
  
  const deliveredThisMonth = vehicles.filter(v => v.actualDeliveryDate && v.actualDeliveryDate.startsWith('2026-06')).length;
  elements.kpiDeliveredMonth.textContent = deliveredThisMonth;
  
  const readyForDelivery = vehicles.filter(v => v.vehicleStatus === 'Ready for Delivery').length;
  elements.kpiReadyDelivery.textContent = readyForDelivery;

  // Department bottlenecks (Pending & Not Attended)
  const stats = {};
  DEPARTMENT_KEYS.forEach(key => {
    stats[key] = { pending: 0, notAttended: 0 };
  });

  vehicles.forEach(v => {
    DEPARTMENT_KEYS.forEach(key => {
      const statusField = SECTIONS[key].statusField;
      const statusVal = v[statusField] || STATUS_VALUES.NOT_ATTENDED;
      if (statusVal === STATUS_VALUES.PENDING) {
        stats[key].pending++;
      } else if (statusVal === STATUS_VALUES.NOT_ATTENDED) {
        stats[key].notAttended++;
      }
    });
  });

  // Set values to DOM elements
  elements.btnFinP.textContent = `P: ${stats.finance.pending}`;
  elements.btnFinN.textContent = `N: ${stats.finance.notAttended}`;
  
  elements.btnTmaP.textContent = `P: ${stats.tma.pending}`;
  elements.btnTmaN.textContent = `N: ${stats.tma.notAttended}`;
  
  elements.btnFileP.textContent = `P: ${stats.file.pending}`;
  elements.btnFileN.textContent = `N: ${stats.file.notAttended}`;
  
  elements.btnAccP.textContent = `P: ${stats.accounts.pending}`;
  elements.btnAccN.textContent = `N: ${stats.accounts.notAttended}`;
  
  elements.btnInsP.textContent = `P: ${stats.insurance.pending}`;
  elements.btnInsN.textContent = `N: ${stats.insurance.notAttended}`;
  
  elements.btnRegP.textContent = `P: ${stats.registration.pending}`;
  elements.btnRegN.textContent = `N: ${stats.registration.notAttended}`;
  
  elements.btnTmgaP.textContent = `P: ${stats.tmga.pending}`;
  elements.btnTmgaN.textContent = `N: ${stats.tmga.notAttended}`;
  
  elements.btnPdiP.textContent = `P: ${stats.pdi.pending}`;
  elements.btnPdiN.textContent = `N: ${stats.pdi.notAttended}`;
}

// Filter Logic Change Handlers
function handleFilterChange() {
  state.filters.global = elements.filterGlobal.value;
  state.filters.status = elements.filterStatus.value;
  state.filters.ca = elements.filterCa.value;
  state.filters.tl = elements.filterTl.value;
  state.filters.expDate = elements.filterExpDate.value;
  state.filters.actDate = elements.filterActDate.value;
  state.filters.financeStatus = elements.filterFinStatus.value;
  state.filters.tmaStatus = elements.filterTmaStatus.value;
  state.filters.accountsStatus = elements.filterAccStatus.value;
  state.filters.registrationStatus = elements.filterRegStatus.value;
  state.filters.pdiStatus = elements.filterPdiStatus.value;
  
  renderVehicles();
}

// Filter Application Filter Implementation
function getFilteredVehicles() {
  return state.vehicles.filter(v => {
    // 1. Global Search
    if (state.filters.global) {
      const term = state.filters.global.toLowerCase();
      const matchText = `${v.customerName} ${v.mobileNumber} ${v.orderNumber} ${v.chassisNumber} ${v.variant} ${v.ca} ${v.tl}`.toLowerCase();
      if (!matchText.includes(term)) return false;
    }
    // 2. Dropdown Select filters
    if (state.filters.status && v.vehicleStatus !== state.filters.status) return false;
    if (state.filters.ca && v.ca !== state.filters.ca) return false;
    if (state.filters.tl && v.tl !== state.filters.tl) return false;
    if (state.filters.expDate && v.expectedDeliveryDate !== state.filters.expDate) return false;
    if (state.filters.actDate && v.actualDeliveryDate !== state.filters.actDate) return false;
    
    // 3. Department Status Filters
    if (state.filters.financeStatus && v.financeStatus !== state.filters.financeStatus) return false;
    if (state.filters.tmaStatus && v.tmaStatus !== state.filters.tmaStatus) return false;
    if (state.filters.accountsStatus && v.accountsStatus !== state.filters.accountsStatus) return false;
    if (state.filters.registrationStatus && v.registrationStatus !== state.filters.registrationStatus) return false;
    if (state.filters.pdiStatus && v.pdiStatus !== state.filters.pdiStatus) return false;
    
    return true;
  });
}

// Calculate Card border class
function calculateCardBorderClass(vehicle) {
  const statuses = DEPARTMENT_KEYS.map(key => vehicle[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED);
  
  if (statuses.some(s => s === STATUS_VALUES.PENDING)) {
    return 'status-pending-border';
  }
  if (statuses.some(s => s === STATUS_VALUES.NOT_ATTENDED)) {
    return 'status-not-attended-border';
  }
  if (statuses.every(s => s === STATUS_VALUES.APPROVED)) {
    return 'status-approved-border';
  }
  return 'status-not-attended-border';
}

// Calculate progress bar percent
function calculateProgress(vehicle) {
  let score = 0;
  DEPARTMENT_KEYS.forEach(key => {
    const s = vehicle[SECTIONS[key].statusField] || STATUS_VALUES.NOT_ATTENDED;
    if (s === STATUS_VALUES.APPROVED) score += 1;
    else if (s === STATUS_VALUES.PENDING) score += 0.5;
  });
  return Math.round((score / DEPARTMENT_KEYS.length) * 100);
}

// Find the first pending workflow block
function getPendingDepartment(vehicle) {
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

// Render Vehicle Views (Grid + List)
function renderVehicles() {
  const filtered = getFilteredVehicles();
  elements.lblResultCount.textContent = filtered.length;
  elements.lblTotalCount.textContent = state.vehicles.length;

  // A. Render Grid View Cards
  elements.gridContainer.innerHTML = '';
  
  if (filtered.length === 0) {
    elements.gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: white; border-radius: 8px; border: 1px dashed var(--border-light); color: var(--text-muted);">
        <p style="font-weight: 600;">No vehicle records match current filters.</p>
      </div>
    `;
  }

  filtered.forEach(vehicle => {
    const borderClass = calculateCardBorderClass(vehicle);
    const progress = calculateProgress(vehicle);
    const pendingDept = getPendingDepartment(vehicle);
    
    const card = document.createElement('div');
    card.className = `vehicle-card ${borderClass}`;
    card.setAttribute('data-chassis', vehicle.chassisNumber);
    card.onclick = () => openDrawer(vehicle);
    
    card.innerHTML = `
      <div class="card-header-info">
        <div class="card-title-group">
          <h4>${vehicle.customerName}</h4>
          <div class="card-subtitle">${vehicle.pl} ${vehicle.variant}</div>
        </div>
        <span class="vehicle-status-badge">${vehicle.vehicleStatus}</span>
      </div>
      
      <div class="card-details-grid">
        <div class="card-detail-item">
          <span class="card-detail-label">Mobile</span>
          <span class="card-detail-value">${vehicle.mobileNumber}</span>
        </div>
        <div class="card-detail-item">
          <span class="card-detail-label">Branch</span>
          <span class="card-detail-value">Perinthalmanna</span>
        </div>
        <div class="card-detail-item">
          <span class="card-detail-label">Advisor (CA)</span>
          <span class="card-detail-value">${vehicle.ca}</span>
        </div>
        <div class="card-detail-item">
          <span class="card-detail-label">Team Leader (TL)</span>
          <span class="card-detail-value">${vehicle.tl}</span>
        </div>
        <div class="card-detail-item" style="grid-column: 1/-1;">
          <span class="card-detail-label">Expected Delivery</span>
          <span class="card-detail-value">${vehicle.expectedDeliveryDate || 'Not Scheduled'}</span>
        </div>
      </div>
      
      <div class="card-progress-section">
        <div class="progress-label-bar">
          <span>Workflow Progress</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill ${progress === 100 ? 'all-approved' : ''}" style="width: ${progress}%;"></div>
        </div>
        
        <div class="card-pending-dept-wrapper">
          <span class="pending-dept-label">Current Pipeline:</span>
          <span class="pending-dept-value ${pendingDept.status.toLowerCase().replace(' ', '-')}">
            ${pendingDept.name} (${pendingDept.status})
          </span>
        </div>
      </div>
    `;
    elements.gridContainer.appendChild(card);
  });

  // B. Render Table List View Rows
  elements.tableBody.innerHTML = '';
  if (filtered.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No matching vehicle records found.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(vehicle => {
    const progress = calculateProgress(vehicle);
    const tr = document.createElement('tr');
    tr.setAttribute('data-chassis', vehicle.chassisNumber);
    tr.onclick = () => openDrawer(vehicle);
    
    const getBadge = (statusVal) => {
      const cls = statusVal.toLowerCase().replace(' ', '-');
      return `<span class="badge-status ${cls}"><span class="badge-dot"></span>${statusVal}</span>`;
    };

    tr.innerHTML = `
      <td style="font-weight: 600; color: var(--primary-navy);">${vehicle.customerName}</td>
      <td style="font-family: monospace; font-size: 0.8rem;">${vehicle.chassisNumber}</td>
      <td>${vehicle.pl} <span style="font-size: 0.75rem; color: var(--text-muted);">${vehicle.variant}</span></td>
      <td>Perinthalmanna</td>
      <td>${vehicle.expectedDeliveryDate || 'N/A'}</td>
      <td>${getBadge(vehicle.financeStatus)}</td>
      <td>${getBadge(vehicle.tmaStatus)}</td>
      <td>${getBadge(vehicle.accountsStatus)}</td>
      <td>${getBadge(vehicle.registrationStatus)}</td>
      <td>${getBadge(vehicle.pdiStatus)}</td>
      <td>${getBadge(vehicle.deliveryStatus)}</td>
      <td style="font-weight: 700; color: var(--primary-blue);">${progress}%</td>
    `;
    elements.tableBody.appendChild(tr);
  });
}

// Render Audit Logs
async function renderAuditLogs(filterKeyword = '') {
  try {
    const logs = await getAuditLogs();
    elements.auditTableBody.innerHTML = '';
    
    const filtered = logs.filter(log => {
      if (!filterKeyword) return true;
      const term = filterKeyword.toLowerCase();
      return `${log.timestamp} ${log.chassisNumber} ${log.customerName} ${log.updatedBy} ${log.department} ${log.previousStatus} ${log.newStatus} ${log.remarks}`
        .toLowerCase()
        .includes(term);
    });

    if (filtered.length === 0) {
      elements.auditTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">
            No audit history entries matches your filters.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(log => {
      const tr = document.createElement('tr');
      
      const getBadgeClass = (status) => {
        if (status === 'Approved') return 'badge-status approved';
        if (status === 'Pending') return 'badge-status pending';
        if (status === 'Not Attended') return 'badge-status not-attended';
        return '';
      };

      tr.innerHTML = `
        <td style="color: var(--text-muted); font-size: 0.8rem; font-family: monospace;">${log.timestamp}</td>
        <td style="font-family: monospace; font-size: 0.8rem; font-weight: 500;">${log.chassisNumber}</td>
        <td>${log.customerName}</td>
        <td><span class="role-badge" style="background-color: var(--border-light); color: var(--text-dark); border: none; font-size: 0.75rem;">${log.updatedBy}</span></td>
        <td style="font-weight: 600;">${log.department}</td>
        <td><span class="${getBadgeClass(log.previousStatus)}">${log.previousStatus}</span></td>
        <td><span class="${getBadgeClass(log.newStatus)}">${log.newStatus}</span></td>
        <td style="font-style: italic; font-size: 0.8rem; color: var(--secondary-slate); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.remarks}">${log.remarks}</td>
      `;
      elements.auditTableBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Failed to load audit logs:', error);
  }
}

// Drawer Open Action
function openDrawer(vehicle) {
  state.selectedVehicle = vehicle;
  elements.vehicleForm.reset();
  elements.inpAuditRemark.value = '';
  
  const permissions = ROLE_PERMISSIONS[state.currentUser.role];
  
  if (vehicle) {
    elements.drawerTitle.textContent = `Workflow Control - ${vehicle.customerName}`;
    elements.drawerSubtitle.textContent = `Chassis: ${vehicle.chassisNumber} | Booking Date: ${vehicle.date}`;
    
    if (permissions.canDelete) {
      elements.btnDeleteVehicle.style.display = 'block';
    } else {
      elements.btnDeleteVehicle.style.display = 'none';
    }
    
    // Fill all form fields
    Object.keys(SECTIONS).forEach(secKey => {
      const sec = SECTIONS[secKey];
      
      sec.fields.forEach(field => {
        const inp = document.getElementById(`inp-${secKey}-${field.name}`);
        if (inp) {
          const val = vehicle[field.name];
          inp.value = (val !== undefined && val !== null) ? val : '';
        }
      });
      
      // Update quick status buttons styling matching the loaded value
      if (sec.isDepartment) {
        const statusField = sec.statusField;
        const currentVal = vehicle[statusField] || STATUS_VALUES.NOT_ATTENDED;
        const btnGroup = document.getElementById(`quick-status-${secKey}`);
        if (btnGroup) {
          btnGroup.querySelectorAll('.quick-status-btn').forEach(btn => {
            if (btn.getAttribute('data-value') === currentVal) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }
      }
    });

    // Make Chassis Number Read-Only as it is the Primary Key
    const chassisInp = document.getElementById('inp-vehicle-chassisNumber');
    if (chassisInp) chassisInp.disabled = true;

  } else {
    elements.drawerTitle.textContent = 'Create New Vehicle Booking';
    elements.drawerSubtitle.textContent = 'System Entry - Active Session';
    elements.btnDeleteVehicle.style.display = 'none';
    
    // Setup Default Values
    Object.keys(SECTIONS).forEach(secKey => {
      const sec = SECTIONS[secKey];
      sec.fields.forEach(field => {
        const inp = document.getElementById(`inp-${secKey}-${field.name}`);
        if (inp) {
          if (field.default !== undefined) {
            inp.value = field.default;
          } else if (field.name === 'date') {
            inp.value = SIMULATED_TODAY;
          } else if (field.name === 'branch') {
            inp.value = 'Perinthalmanna';
          } else {
            inp.value = '';
          }
        }
      });

      if (sec.isDepartment) {
        // Default statuses in creation
        const btnGroup = document.getElementById(`quick-status-${secKey}`);
        if (btnGroup) {
          btnGroup.querySelectorAll('.quick-status-btn').forEach(btn => {
            if (btn.getAttribute('data-value') === STATUS_VALUES.NOT_ATTENDED) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }
        
        const hiddenInp = document.getElementById(`inp-${secKey}-${sec.statusField}`);
        if (hiddenInp) hiddenInp.value = STATUS_VALUES.NOT_ATTENDED;
      }
    });

    // Make Chassis Number Editable on new creations
    const chassisInp = document.getElementById('inp-vehicle-chassisNumber');
    if (chassisInp) chassisInp.disabled = false;
  }

  // Handle section lockouts depending on permissions
  applyDrawerLockouts();

  // Show overlay slide-out drawer
  elements.drawerOverlay.classList.add('open');
}

// Disable/Lock fields dynamically in drawer depending on user role
function applyDrawerLockouts() {
  const permissions = ROLE_PERMISSIONS[state.currentUser.role];
  
  Object.keys(SECTIONS).forEach(secKey => {
    const sec = SECTIONS[secKey];
    const block = document.getElementById(`sec-${secKey}`);
    const isEditable = permissions.editableSections.includes(secKey);
    
    if (block) {
      if (isEditable) {
        block.classList.add('editable');
        block.classList.remove('readonly');
        
        const badge = block.querySelector('.section-lock-badge');
        if (badge) badge.innerHTML = `<span style="color:var(--status-approved-color);">●</span> Active`;
        
        // Enable fields
        sec.fields.forEach(field => {
          const inp = document.getElementById(`inp-${secKey}-${field.name}`);
          // Prevent enabling primary key chassis number on edit
          if (inp && !(field.name === 'chassisNumber' && state.selectedVehicle)) {
            inp.disabled = false;
          }
        });
        
        // Enable quick buttons
        if (sec.isDepartment) {
          const btnGroup = document.getElementById(`quick-status-${secKey}`);
          if (btnGroup) {
            btnGroup.querySelectorAll('.quick-status-btn').forEach(btn => {
              btn.disabled = false;
            });
          }
        }

      } else {
        block.classList.remove('editable');
        block.classList.add('readonly');
        
        const badge = block.querySelector('.section-lock-badge');
        if (badge) badge.innerHTML = `🔒 Locked`;
        
        // Disable fields
        sec.fields.forEach(field => {
          const inp = document.getElementById(`inp-${secKey}-${field.name}`);
          if (inp) inp.disabled = true;
        });
        
        // Disable quick buttons
        if (sec.isDepartment) {
          const btnGroup = document.getElementById(`quick-status-${secKey}`);
          if (btnGroup) {
            btnGroup.querySelectorAll('.quick-status-btn').forEach(btn => {
              btn.disabled = true;
            });
          }
        }
      }
    }
  });

  // Enable/Disable Save changes button
  if (state.currentUser.role === 'MANAGEMENT') {
    elements.btnSaveDrawer.disabled = true;
    elements.btnSaveDrawer.textContent = 'View-Only Mode';
    elements.inpAuditRemark.disabled = true;
    elements.inpAuditRemark.required = false;
  } else {
    elements.btnSaveDrawer.disabled = false;
    elements.btnSaveDrawer.textContent = 'Save Changes';
    elements.inpAuditRemark.disabled = false;
    elements.inpAuditRemark.required = true;
  }
}

// Drawer Close Action
function closeDrawer() {
  elements.drawerOverlay.classList.remove('open');
  state.selectedVehicle = null;
}

// Handle Vehicle Deletion
async function handleDeleteVehicle() {
  if (!state.selectedVehicle) return;
  const chassis = state.selectedVehicle.chassisNumber;
  const custName = state.selectedVehicle.customerName;
  
  if (confirm(`Are you sure you want to delete the booking for ${custName} (${chassis})?`)) {
    try {
      await deleteVehicle(chassis, state.currentUser.role);
      
      state.vehicles = await getVehicles();
      renderKPIs();
      renderVehicles();
      await renderAuditLogs();
      closeDrawer();
      showToast('Record Deleted', `Vehicle details for ${custName} removed.`, 'success');
    } catch (error) {
      showToast('Deletion Failed', error.message, 'error');
    }
  }
}

// Check Notification Rules on Save
function checkStatusNotificationRules(auditLogs) {
  auditLogs.forEach(log => {
    const isApproved = log.newStatus === STATUS_VALUES.APPROVED;
    
    if (log.department === 'Finance' && isApproved) {
      showToast('Notification Sent', `Finance approved for customer ${log.customerName}.`, 'success');
    }
    if (log.department === 'Registration' && isApproved) {
      showToast('Notification Sent', `Vehicle Registration approved for customer ${log.customerName}.`, 'success');
    }
    if (log.department === 'Delivery' && isApproved) {
      showToast('Notification Sent', `Vehicle delivered to customer ${log.customerName}! Workflow completed.`, 'success');
    }
  });
}

// Submit Form Handler (Save changes / Create new)
async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (state.currentUser.role === 'MANAGEMENT') {
    closeDrawer();
    return;
  }

  // Create temporary copy representing changes
  const submissionData = state.selectedVehicle ? { ...state.selectedVehicle } : {};
  
  // Read all form inputs
  Object.keys(SECTIONS).forEach(secKey => {
    const sec = SECTIONS[secKey];
    
    const isEditable = ROLE_PERMISSIONS[state.currentUser.role].editableSections.includes(secKey);
    if (state.selectedVehicle && !isEditable) {
      return; 
    }
    
    sec.fields.forEach(field => {
      const inp = document.getElementById(`inp-${secKey}-${field.name}`);
      if (inp) {
        let val = inp.value;
        if (field.type === 'number') {
          val = val !== '' ? Number(val) : 0;
        }
        submissionData[field.name] = val;
      }
    });
  });

  // Force Perinthalmanna branch lockdown
  submissionData.branch = "Perinthalmanna";

  const remarks = elements.inpAuditRemark.value.trim() || 'Details saved by ' + state.currentUser.name;
  
  try {
    if (state.selectedVehicle) {
      // Editing existing vehicle
      const auditEntries = await saveVehicle(submissionData, state.currentUser.role, remarks);
      
      // Check notification triggers
      checkStatusNotificationRules(auditEntries);
      
      // Special manual notification checks (e.g. check status changes on fields not handled by section-status)
      if (state.selectedVehicle.vehicleStatus !== submissionData.vehicleStatus) {
        await addAuditLog({
          chassisNumber: submissionData.chassisNumber,
          customerName: submissionData.customerName,
          updatedBy: state.currentUser.role,
          department: 'Vehicle Control',
          previousStatus: state.selectedVehicle.vehicleStatus,
          newStatus: submissionData.vehicleStatus,
          remarks: `Vehicle Status updated to ${submissionData.vehicleStatus}. ${remarks}`
        });

        // Trigger notifications
        if (submissionData.vehicleStatus === 'Ready for Delivery') {
          showToast('Notification Sent', `Vehicle Ready for Delivery! All basic parameters cleared.`, 'success');
        }
        if (submissionData.vehicleStatus === 'Delivered') {
          showToast('Notification Sent', `Vehicle delivered to customer ${submissionData.customerName}! Workflow completed.`, 'success');
        }
      }

      showToast('Changes Saved', `Successfully updated workflow file for ${submissionData.customerName}.`, 'success');

    } else {
      // Creating a new booking
      await createVehicle(submissionData, state.currentUser.role);
      showToast('Booking Created', `New customer booking ${submissionData.customerName} entered in database.`, 'success');
    }

    // Refresh views
    state.vehicles = await getVehicles();
    populateFiltersDropdowns();
    renderKPIs();
    renderVehicles();
    await renderAuditLogs();
    closeDrawer();

  } catch (error) {
    showToast('Save Failed', error.message, 'error');
  }
}

// === ADMIN USER MANAGEMENT PANEL FUNCTIONS ===

async function renderUsersList() {
  try {
    const users = await getUsers(state.currentUser.role);
    elements.usersTableBody.innerHTML = '';
    
    users.forEach(user => {
      const tr = document.createElement('tr');
      
      // Mask passwords for security if needed, but show edit actions
      const displayPass = user.username === 'admin' ? '••••••••' : user.password;
      
      const editBtn = `<button class="btn-edit-mini" data-username="${user.username}">Edit Password/Role</button>`;
      const deleteBtn = user.username === 'admin' || user.username === state.currentUser.username
        ? `<span style="font-size:0.75rem; color:var(--text-muted);">Protected</span>`
        : `<button class="btn-danger-mini" data-username="${user.username}">Delete</button>`;
      
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--primary-navy);">${user.name}</td>
        <td style="font-family:monospace;">${user.username}</td>
        <td><span class="role-badge" style="background-color: var(--border-light); color: var(--text-dark); border: none; font-size: 0.75rem;">${user.role}</span></td>
        <td style="font-family:monospace; color:var(--text-muted);">${displayPass}</td>
        <td>
          <div class="user-admin-actions">
            ${editBtn}
            ${deleteBtn}
          </div>
        </td>
      `;
      
      // Bind action listeners
      tr.querySelector('.btn-edit-mini').onclick = () => loadUserToEditForm(user);
      const del = tr.querySelector('.btn-danger-mini');
      if (del) {
        del.onclick = () => handleDeleteUserClick(user.username);
      }
      
      elements.usersTableBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Failed to load user directory:', error);
  }
}

function loadUserToEditForm(user) {
  elements.inpUserEditMode.value = 'edit';
  elements.inpUserUsername.value = user.username;
  elements.inpUserUsername.disabled = true; // Cannot edit username string
  elements.inpUserPassword.value = user.password;
  elements.inpUserName.value = user.name;
  elements.inpUserRole.value = user.role;
  
  // Disable role edits for primary admin to prevent self lockout
  if (user.username === 'admin') {
    elements.inpUserRole.disabled = true;
  } else {
    elements.inpUserRole.disabled = false;
  }
  
  elements.userFormTitle.textContent = `Edit Account: ${user.username}`;
  elements.btnUserCancel.style.display = 'block';
}

function resetUserAdminForm() {
  elements.userAdminForm.reset();
  elements.inpUserEditMode.value = 'create';
  elements.inpUserUsername.disabled = false;
  elements.inpUserRole.disabled = false;
  elements.userFormTitle.textContent = 'Register Employee Account';
  elements.btnUserCancel.style.display = 'none';
}

async function handleUserFormSubmit(e) {
  e.preventDefault();
  
  const mode = elements.inpUserEditMode.value;
  const username = elements.inpUserUsername.value.trim();
  const password = elements.inpUserPassword.value.trim();
  const name = elements.inpUserName.value.trim();
  const role = elements.inpUserRole.value;
  
  const payload = { username, password, name, role };
  
  try {
    if (mode === 'create') {
      await createUser(payload, state.currentUser.role);
      showToast('Account Created', `Successfully added login account for ${name}.`, 'success');
    } else {
      await updateUser(username, payload, state.currentUser.role);
      showToast('Account Updated', `Successfully updated password/details for ${name}.`, 'success');
    }
    
    resetUserAdminForm();
    await renderUsersList();
  } catch (error) {
    showToast('Operation Failed', error.message, 'error');
  }
}

async function handleDeleteUserClick(username) {
  if (confirm(`Are you sure you want to delete login account: ${username}?`)) {
    try {
      await deleteUser(username, state.currentUser.role);
      showToast('Account Deleted', `Login credentials for ${username} removed.`, 'success');
      await renderUsersList();
    } catch (error) {
      showToast('Failed to Delete', error.message, 'error');
    }
  }
}

// Toast Notification Panel controller
function showToast(title, message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'success' : ''}`;
  
  const icon = type === 'success' 
    ? `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--primary-blue);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `
    ${icon}
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  elements.toastContainer.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s reverse';
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, 5000);
}

}
