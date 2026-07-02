import React, { useEffect, useRef } from 'react';
import './index.css';
import { initApp } from './controllers/mainController.js';

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.hasInit) {
      containerRef.current.innerHTML = `
  <div class="app-container">
    
    <!-- 1. FULL-SCREEN LOGIN OVERLAY -->
    <div id="login-overlay" class="modal-overlay" style="display: flex; justify-content: center; align-items: center; background: linear-gradient(135deg, var(--primary-navy) 0%, #001a3a 100%);">
      <div class="modal-drawer" style="max-width: 420px; height: auto; border-radius: var(--radius-lg); box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
        <div class="modal-header" style="background-color: transparent; border-bottom: none; flex-direction: column; align-items: center; padding: 30px 24px 10px 24px;">
          <h2 style="font-family: var(--font-title); font-size: 2rem; font-weight: 800; color: var(--primary-blue); letter-spacing: 1px;">KVR TATA</h2>
          <p style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px;">Workflow Tracker Login</p>
        </div>
        <form id="login-form" class="modal-body" style="padding: 24px; gap: 16px;">
          <div class="form-field">
            <label for="inp-login-username">Username</label>
            <input type="text" id="inp-login-username" placeholder="Enter username..." required style="padding: 10px 14px; font-size: 0.95rem;">
          </div>
          <div class="form-field">
            <label for="inp-login-password">Password</label>
            <input type="password" id="inp-login-password" placeholder="Enter password..." required style="padding: 10px 14px; font-size: 0.95rem;">
          </div>
          <div id="login-error" style="color: #dc2626; font-size: 0.8rem; font-weight: 600; text-align: center; display: none; padding: 4px 0;"></div>
          <button type="submit" class="btn-primary" style="padding: 12px; font-size: 0.95rem; font-weight: 700; width: 100%; justify-content: center; margin-top: 10px;">Sign In</button>
        </form>
        <div style="text-align: center; padding: 0 24px 30px 24px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
          Perinthalmanna Showroom Control Panel<br>For authorized dealer employees only.
        </div>
      </div>
    </div>

    <!-- 2. STICKY HEADER (Visible when Logged In) -->
    <header class="role-simulator-bar" id="app-header" style="display: none;">
      <div class="role-title">
        <span class="role-logo">KVR TATA</span>
        <span class="role-badge">Delivery Workflow Manager</span>
      </div>
      <div class="role-selector-wrapper" id="header-user-profile" style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600;">
          Welcome, <span id="lbl-user-name" style="color: white; font-weight: 700;">Employee</span> 
          (<span id="lbl-user-role" style="color: var(--accent-cyan); font-weight: 700;">Role</span>)
        </span>
        <button id="btn-logout" class="btn-secondary" style="padding: 4px 12px; font-size: 0.75rem; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; font-weight: 700; cursor: pointer; transition: 0.2s;">Logout</button>
      </div>
    </header>

    <!-- 3. BRAND HEADER & NAV TABS (Visible when Logged In) -->
    <section class="main-header" id="app-nav" style="display: none;">
      <div class="brand-details">
        <h2>Delivery Master Control</h2>
        <p>Real-time vehicle tracking from booking to home visit - <b>Perinthalmanna Branch</b></p>
      </div>
      <nav class="nav-tabs">
        <button class="tab-btn active" id="tab-dashboard" data-tab="dashboard-view">
          <svg class="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          Dashboard
        </button>
        <button class="tab-btn" id="tab-vehicles" data-tab="vehicles-view">
          <svg class="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Delivery Master List
        </button>
        <button class="tab-btn" id="tab-audit" data-tab="audit-view">
          <svg class="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Audit History Logs
        </button>
        <!-- ADMIN ONLY TAB -->
        <button class="tab-btn" id="tab-users" data-tab="users-view" style="display: none;">
          <svg class="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Users List
        </button>
      </nav>
    </section>

    <!-- 4. MAIN CONTENT AREA (Visible when Logged In) -->
    <main class="content-wrapper" id="app-main" style="display: none;">
      
      <!-- A. DASHBOARD VIEW -->
      <div id="dashboard-view" class="tab-content active">
        
        <!-- KPI METRICS ROW -->
        <div class="kpi-container">
          <div class="kpi-card">
            <div class="kpi-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="11" y2="17"></line></svg>
            </div>
            <div class="kpi-info">
              <div class="kpi-value" id="kpi-total-bookings">0</div>
              <div class="kpi-label">Total Bookings</div>
            </div>
          </div>
          <div class="kpi-card green-theme">
            <div class="kpi-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="kpi-info">
              <div class="kpi-value" id="kpi-delivered-today">0</div>
              <div class="kpi-label">Delivered Today</div>
            </div>
          </div>
          <div class="kpi-card green-theme">
            <div class="kpi-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="kpi-info">
              <div class="kpi-value" id="kpi-delivered-month">0</div>
              <div class="kpi-label">Delivered This Month</div>
            </div>
          </div>
          <div class="kpi-card yellow-theme">
            <div class="kpi-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="kpi-info">
              <div class="kpi-value" id="kpi-ready-delivery">0</div>
              <div class="kpi-label">Ready For Delivery</div>
            </div>
          </div>
        </div>

        <!-- DEPARTMENT BOTTLE BARS -->
        <div class="dept-bottleneck-section">
          <div class="section-title-bar">
            <h3>Workflow Pipelines & Department Bottlenecks</h3>
            <span class="list-info-text">Pending attention or approvals in Perinthalmanna</span>
          </div>
          <div class="dept-kpi-grid">
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">Finance</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-fin-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-fin-n">N: 0</span>
              </div>
            </div>
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">TMA</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-tma-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-tma-n">N: 0</span>
              </div>
            </div>
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">File (Tally)</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-file-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-file-n">N: 0</span>
              </div>
            </div>
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">Accounts</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-acc-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-acc-n">N: 0</span>
              </div>
            </div>
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">Insurance</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-ins-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-ins-n">N: 0</span>
              </div>
            </div>
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">Registration</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-reg-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-reg-n">N: 0</span>
              </div>
            </div>
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">TMGA</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-tmga-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-tmga-n">N: 0</span>
              </div>
            </div>
            <div class="dept-kpi-pill">
              <div class="dept-kpi-name">PDI</div>
              <div class="dept-kpi-stats">
                <span class="badge-mini pending" title="Pending" id="bottleneck-pdi-p">P: 0</span>
                <span class="badge-mini not-attended" title="Not Attended" id="bottleneck-pdi-n">N: 0</span>
              </div>
            </div>
          </div>
        </div>



      </div>

      <!-- B. DELIVERY MASTER VIEW -->
      <div id="vehicles-view" class="tab-content">
        
        <!-- FILTER BOX -->
        <div class="filter-panel">
          <div class="section-title-bar">
            <h3>Filters & Searching</h3>
            <button id="btn-clear-filters" class="btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;">Clear Filters</button>
          </div>
          <div class="filter-grid">
            <div class="search-wrapper">
              <svg class="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="filter-global" class="global-search-input" placeholder="Search by customer name, mobile, order number, or chassis number...">
            </div>

            <div class="filter-group">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <label for="filter-branch">Branch Office</label>
                <button id="btn-add-branch" class="btn-text" style="font-size: 0.75rem; color: var(--primary-blue); cursor: pointer; border: none; background: none; padding: 0; font-weight: 600;">+ Add Branch</button>
              </div>
              <select id="filter-branch" class="filter-select">
                <option value="Perinthalmanna">Perinthalmanna</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-status">Vehicle Status</label>
              <select id="filter-status" class="filter-select">
                <option value="">All Statuses</option>
                <option value="Booked">Booked</option>
                <option value="Allotted">Allotted</option>
                <option value="In-Transit">In-Transit</option>
                <option value="PDI Hold">PDI Hold</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-workflow">Workflow Filter</label>
              <select id="filter-workflow" class="filter-select">
                <option value="">All</option>
                <option value="Booked">Booking / Booked</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-pending">Pending Filter</label>
              <select id="filter-pending" class="filter-select">
                <option value="">All Vehicles</option>
                <option value="any">Any Pending Task</option>
                <option value="finance">Finance Pending</option>
                <option value="tma">TMA Pending</option>
                <option value="file">File (Tally) Pending</option>
                <option value="accounts">Accounts Pending</option>
                <option value="insurance">Insurance Pending</option>
                <option value="registration">Registration Pending</option>
                <option value="tmga">TMGA Pending</option>
                <option value="pdi">PDI Pending</option>
                <option value="delivery">Delivery Pending</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-ca">Customer Advisor (CA)</label>
              <select id="filter-ca" class="filter-select">
                <option value="">All CAs</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-tl">Team Leader (TL)</label>
              <select id="filter-tl" class="filter-select">
                <option value="">All TLs</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-exp-date">Expected Delivery</label>
              <input type="date" id="filter-exp-date" class="filter-date">
            </div>

            <div class="filter-group">
              <label for="filter-act-date">Actual Delivery</label>
              <input type="date" id="filter-act-date" class="filter-date">
            </div>

            <div class="filter-group">
              <label for="filter-fin-status">Finance Status</label>
              <select id="filter-fin-status" class="filter-select filter-dept-status">
                <option value="">Any</option>
                <option value="Not Attended">Not Attended</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-tma-status">TMA Status</label>
              <select id="filter-tma-status" class="filter-select filter-dept-status">
                <option value="">Any</option>
                <option value="Not Attended">Not Attended</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-acc-status">Accounts Status</label>
              <select id="filter-acc-status" class="filter-select filter-dept-status">
                <option value="">Any</option>
                <option value="Not Attended">Not Attended</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-reg-status">Registration Status</label>
              <select id="filter-reg-status" class="filter-select filter-dept-status">
                <option value="">Any</option>
                <option value="Not Attended">Not Attended</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-pdi-status">PDI Status</label>
              <select id="filter-pdi-status" class="filter-select filter-dept-status">
                <option value="">Any</option>
                <option value="Not Attended">Not Attended</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            
          </div>
        </div>

        <!-- LIST HEAD CONTROLS -->
        <div class="list-header-controls">
          <div class="list-info-text">
            Showing <span id="lbl-result-count">0</span> of <span id="lbl-total-count">0</span> Vehicles
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button id="btn-add-vehicle" class="btn-primary" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Booking
            </button>
            <div class="view-toggles">
              <button class="view-btn" id="btn-view-grid" title="Grid View">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button class="view-btn active" id="btn-view-list" title="Table View">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- GRID VIEW PANEL -->
        <div id="grid-container" class="vehicle-grid" style="display: none;">
          <!-- Populated dynamically -->
        </div>

        <!-- LIST VIEW TABLE PANEL -->
        <div id="list-container" class="list-view-container">
          <table class="table-master">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Chassis Number</th>
                <th>PL / Variant</th>
                <th>Branch</th>
                <th>Expected Delivery</th>
                <th>Fin Status</th>
                <th>TMA Status</th>
                <th>Acc Status</th>
                <th>Reg Status</th>
                <th>PDI Status</th>
                <th>Deliv Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody id="table-body">
              <!-- Populated dynamically -->
            </tbody>
          </table>
        </div>

      </div>

      <!-- C. AUDIT TRAIL LOGS VIEW -->
      <div id="audit-view" class="tab-content">
        <div class="audit-log-container">
          <div class="main-header" style="background-color: transparent; border-bottom: 1px solid var(--border-light); padding: 16px 20px;">
            <h3>Global Audit History & System Logs</h3>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="search-audit" class="filter-select" placeholder="Filter logs by keyword..." style="min-width: 250px;">
              <button id="btn-clear-audits" class="btn-secondary" style="border-color: #cbd5e1; font-size: 0.8rem;">Clear Audit Files</button>
            </div>
          </div>
          <div class="audit-table-wrapper">
            <table class="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Chassis Number</th>
                  <th>Customer Name</th>
                  <th>Changed By</th>
                  <th>Department Section</th>
                  <th>Previous Status</th>
                  <th>New Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody id="audit-table-body">
                <!-- Populated dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- D. USERS MANAGEMENT VIEW (Admin Only) -->
      <div id="users-view" class="tab-content">
        <div style="display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start;">
          <!-- Left side: Users list -->
          <div class="audit-log-container">
            <div class="main-header" style="background-color: transparent; border-bottom: 1px solid var(--border-light); padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 16px; flex-wrap: wrap;">
                <div>
                  <h3 style="margin: 0; font-size: 1.25rem;">Active Employee Directory</h3>
                  <span class="list-info-text">Logins and permissions for the dealerships</span>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label for="filter-user-role" style="font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Role / Dept</label>
                    <select id="filter-user-role" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; border: 1.5px solid var(--border-light); outline: none; background: var(--bg-card); color: var(--text-dark); min-width: 130px; font-weight: 500;">
                      <option value="">All Roles</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="CRM">CRM</option>
                      <option value="FINANCE">FINANCE</option>
                      <option value="TMA">TMA</option>
                      <option value="ACCOUNTS">ACCOUNTS</option>
                      <option value="INSURANCE">INSURANCE</option>
                      <option value="REGISTRATION">REGISTRATION</option>
                      <option value="TMGA">TMGA</option>
                      <option value="PDI">PDI</option>
                      <option value="DELIVERY">DELIVERY</option>
                      <option value="MANAGEMENT">MANAGEMENT</option>
                    </select>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label for="filter-user-branch" style="font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Branch Office</label>
                    <select id="filter-user-branch" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; border: 1.5px solid var(--border-light); outline: none; background: var(--bg-card); color: var(--text-dark); min-width: 140px; font-weight: 500;">
                      <!-- Populated dynamically -->
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="audit-table-wrapper">
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Role / Department</th>
                    <th>Assigned Branch</th>
                    <th>Password</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="users-table-body">
                  <!-- Populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>
          <!-- Right side: Add / Edit form -->
          <div class="form-section-block editable" style="background-color: var(--bg-card); box-shadow: var(--shadow-md);">
            <div class="form-section-header">
              <h4 id="user-form-title" style="font-size: 1.1rem; font-weight: 700; color: var(--primary-navy);">Register Employee Account</h4>
            </div>
            <form id="user-admin-form" class="form-grid" style="grid-template-columns: 1fr; gap: 14px; margin-top: 10px;">
              <input type="hidden" id="inp-user-edit-mode" value="create">
              <div class="form-field">
                <label for="inp-user-username">Username *</label>
                <input type="text" id="inp-user-username" placeholder="e.g. finance_clerk" required style="padding: 8px 12px; font-size: 0.85rem;">
              </div>
              <div class="form-field">
                <label for="inp-user-password">Password / Credentials *</label>
                <input type="text" id="inp-user-password" placeholder="Set account password..." required style="padding: 8px 12px; font-size: 0.85rem;">
              </div>
              <div class="form-field">
                <label for="inp-user-name">Employee Full Name *</label>
                <input type="text" id="inp-user-name" placeholder="e.g. Anand Kumar" required style="padding: 8px 12px; font-size: 0.85rem;">
              </div>
              <div class="form-field">
                <label for="inp-user-role">Assigned Role *</label>
                <select id="inp-user-role" required style="padding: 8px 12px; font-size: 0.85rem;">
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="CRM">CRM (Bookings/Offers)</option>
                  <option value="FINANCE">FINANCE (Finance Dept)</option>
                  <option value="TMA">TMA (Exchange Dept)</option>
                  <option value="ACCOUNTS">ACCOUNTS (Accounts & Files)</option>
                  <option value="INSURANCE">INSURANCE (Insurance Dept)</option>
                  <option value="REGISTRATION">REGISTRATION (Registration Dept)</option>
                  <option value="TMGA">TMGA (Genuine Accessories)</option>
                  <option value="PDI">PDI (Pre-Delivery Inspection)</option>
                  <option value="DELIVERY">DELIVERY (Delivery Dept)</option>
                  <option value="MANAGEMENT">MANAGEMENT (View-Only)</option>
                </select>
              </div>
              <div class="form-field">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label for="inp-user-branch" style="margin-bottom: 0;">Assigned Branch *</label>
                  <button type="button" id="btn-add-user-branch" style="background: none; border: none; color: var(--primary-blue); font-size: 0.75rem; font-weight: 600; cursor: pointer; padding: 0;">+ New Branch</button>
                </div>
                <select id="inp-user-branch" required style="padding: 8px 12px; font-size: 0.85rem;">
                  <!-- Populated dynamically -->
                </select>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button type="button" id="btn-user-cancel" class="btn-secondary" style="flex: 1; display: none; font-size: 0.8rem; padding: 8px;">Cancel</button>
                <button type="submit" class="btn-primary" style="flex: 2; justify-content: center; font-size: 0.8rem; padding: 8px;">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </main>

    <!-- 5. VEHICLE EDIT DRAWER (Slide-in from Right) -->
    <div class="modal-overlay" id="vehicle-drawer-overlay">
      <div class="modal-drawer">
        <div class="modal-header">
          <div>
            <h3 id="drawer-title">Vehicle Booking Detail Sheet</h3>
            <p id="drawer-subtitle">Chassis: N/A | Booking: N/A</p>
          </div>
          <button class="close-btn" id="btn-close-drawer">&times;</button>
        </div>
        
        <form class="modal-body" id="vehicle-form" autocomplete="off">
          
          <!-- CUSTOMER DETAILS BLOCK -->
          <div class="form-section-block" data-section="customer" id="sec-customer">
            <div class="form-section-header">
              <h4>Customer Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-customer-date">Booking Date *</label>
                <input type="date" id="inp-customer-date" data-field="date" required>
              </div>
              <div class="form-field">
                <label for="inp-customer-customerName">Customer Name *</label>
                <input type="text" id="inp-customer-customerName" data-field="customerName" required>
              </div>
              <div class="form-field">
                <label for="inp-customer-mobileNumber">Mobile Number *</label>
                <input type="tel" id="inp-customer-mobileNumber" data-field="mobileNumber" required>
              </div>
              <div class="form-field">
                <label for="inp-customer-orderNumber">Order Number *</label>
                <input type="text" id="inp-customer-orderNumber" data-field="orderNumber" required>
              </div>
              <div class="form-field">
                <label for="inp-customer-invoiceNumber">Invoice Number</label>
                <input type="text" id="inp-customer-invoiceNumber" data-field="invoiceNumber">
              </div>
              <div class="form-field">
                <label for="inp-customer-source">Booking Source</label>
                <select id="inp-customer-source" data-field="source">
                  <option value="">-- Select --</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                  <option value="Digital Ads">Digital Ads</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Exchange Event">Exchange Event</option>
                  <option value="Co-operative Society">Co-operative Society</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-customer-year">Manufacturing Year *</label>
                <input type="number" id="inp-customer-year" data-field="year" required>
              </div>
            </div>
          </div>

          <!-- VEHICLE DETAILS BLOCK -->
          <div class="form-section-block" data-section="vehicle" id="sec-vehicle">
            <div class="form-section-header">
              <h4>Vehicle Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-vehicle-vehicleStatus">Vehicle Status *</label>
                <select id="inp-vehicle-vehicleStatus" data-field="vehicleStatus" required>
                  <option value="Booked">Booked</option>
                  <option value="Allotted">Allotted</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="PDI Hold">PDI Hold</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-vehicle-chassisNumber">Chassis Number *</label>
                <input type="text" id="inp-vehicle-chassisNumber" data-field="chassisNumber" required>
              </div>
              <div class="form-field">
                <label for="inp-vehicle-fuel">Fuel Type *</label>
                <select id="inp-vehicle-fuel" data-field="fuel" required>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="EV">EV</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-vehicle-pl">Product Line (PL) *</label>
                <select id="inp-vehicle-pl" data-field="pl" required>
                  <option value="Tiago">Tiago</option>
                  <option value="Tigor">Tigor</option>
                  <option value="Altroz">Altroz</option>
                  <option value="Punch">Punch</option>
                  <option value="Nexon">Nexon</option>
                  <option value="Harrier">Harrier</option>
                  <option value="Safari">Safari</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-vehicle-variant">Variant *</label>
                <input type="text" id="inp-vehicle-variant" data-field="variant" required>
              </div>
              <div class="form-field">
                <label for="inp-vehicle-colour">Colour *</label>
                <input type="text" id="inp-vehicle-colour" data-field="colour" required>
              </div>
              <div class="form-field">
                <label for="inp-vehicle-vc">Vehicle Code (VC)</label>
                <input type="text" id="inp-vehicle-vc" data-field="vc">
              </div>
            </div>
          </div>

          <!-- SALES DETAILS BLOCK -->
          <div class="form-section-block" data-section="sales" id="sec-sales">
            <div class="form-section-header">
              <h4>Sales Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-sales-ca">Customer Advisor (CA) *</label>
                <input type="text" id="inp-sales-ca" data-field="ca" required>
              </div>
              <div class="form-field">
                <label for="inp-sales-tl">Team Leader (TL) *</label>
                <input type="text" id="inp-sales-tl" data-field="tl" required>
              </div>
              <div class="form-field">
                <label for="inp-sales-branch">Branch *</label>
                <select id="inp-sales-branch" data-field="branch" required>
                  <!-- Populated dynamically -->
                </select>
              </div>
            </div>
          </div>

          <!-- OFFER DETAILS BLOCK -->
          <div class="form-section-block" data-section="offer" id="sec-offer">
            <div class="form-section-header">
              <h4>Offer Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-offer-hypothecation">Hypothecation (Bank/Self)</label>
                <input type="text" id="inp-offer-hypothecation" data-field="hypothecation">
              </div>
              <div class="form-field">
                <label for="inp-offer-cashDiscount">Cash Discount / Green Bonus (₹)</label>
                <input type="number" id="inp-offer-cashDiscount" data-field="cashDiscount">
              </div>
              <div class="form-field">
                <label for="inp-offer-exchangeLoyalty">Exchange / Loyalty (₹)</label>
                <input type="number" id="inp-offer-exchangeLoyalty" data-field="exchangeLoyalty">
              </div>
              <div class="form-field">
                <label for="inp-offer-corporate">Corporate Discount (₹)</label>
                <input type="number" id="inp-offer-corporate" data-field="corporate">
              </div>
              <div class="form-field">
                <label for="inp-offer-sss">SSS Discount (₹)</label>
                <input type="number" id="inp-offer-sss" data-field="sss">
              </div>
              <div class="form-field">
                <label for="inp-offer-kpkb">KPKB / Special Scheme (₹)</label>
                <input type="number" id="inp-offer-kpkb" data-field="kpkb">
              </div>
              <div class="form-field">
                <label for="inp-offer-solarOffer">Solar Offer (₹)</label>
                <input type="number" id="inp-offer-solarOffer" data-field="solarOffer">
              </div>
              <div class="form-field">
                <label for="inp-offer-priceDifference">Price Difference (₹)</label>
                <input type="number" id="inp-offer-priceDifference" data-field="priceDifference">
              </div>
              <div class="form-field form-group-full">
                <label for="inp-offer-offerRemark">Offer Remark</label>
                <input type="text" id="inp-offer-offerRemark" data-field="offerRemark">
              </div>
            </div>
          </div>

          <!-- FINANCE DETAILS BLOCK -->
          <div class="form-section-block" data-section="finance" id="sec-finance">
            <div class="form-section-header">
              <h4>Finance Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-finance-financeType">Finance Type *</label>
                <select id="inp-finance-financeType" data-field="financeType">
                  <option value="In-House">In-House</option>
                  <option value="Outside Finance">Outside Finance</option>
                  <option value="Cash Booking">Cash Booking</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-finance-onRoadPrice">On Road Price (₹)</label>
                <input type="number" id="inp-finance-onRoadPrice" data-field="onRoadPrice">
              </div>
              <div class="form-field">
                <label for="inp-finance-ip">Initial Payment (IP) (₹)</label>
                <input type="number" id="inp-finance-ip" data-field="ip">
              </div>
              <div class="form-field">
                <label for="inp-finance-loanAmount">Loan Amount (₹)</label>
                <input type="number" id="inp-finance-loanAmount" data-field="loanAmount">
              </div>
              <div class="form-field">
                <label for="inp-finance-balanceAmount">Balance Amount (₹)</label>
                <input type="number" id="inp-finance-balanceAmount" data-field="balanceAmount">
              </div>
              <div class="form-field">
                <label for="inp-finance-fundPercentage">Fund Percentage (%)</label>
                <input type="number" id="inp-finance-fundPercentage" data-field="fundPercentage" min="0" max="100" step="0.1">
              </div>
              <div class="form-field">
                <label for="inp-finance-loanAmountStatus">Loan Amount Status</label>
                <select id="inp-finance-loanAmountStatus" data-field="loanAmountStatus">
                  <option value="Awaiting Login">Awaiting Login</option>
                  <option value="Logged In">Logged In</option>
                  <option value="Sanctioned">Sanctioned</option>
                  <option value="Disbursed">Disbursed</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-finance-financeRemark">Finance Remark</label>
                <input type="text" id="inp-finance-financeRemark" data-field="financeRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>Finance Status *</label>
                <div class="quick-status-buttons" id="quick-status-finance">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-finance-financeStatus" data-field="financeStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>Finance Timestamp (Auto)</label>
                <input type="text" id="inp-finance-financeTimestamp" data-field="financeTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- TMA DETAILS BLOCK -->
          <div class="form-section-block" data-section="tma" id="sec-tma">
            <div class="form-section-header">
              <h4>TMA Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-tma-exchangeYesNo">Exchange Applicable *</label>
                <select id="inp-tma-exchangeYesNo" data-field="exchangeYesNo">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-tma-tmaType">TMA Type</label>
                <select id="inp-tma-tmaType" data-field="tmaType">
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Tata Assured Trade-in">Tata Assured Trade-in</option>
                  <option value="Local Broker Dealer">Local Broker Dealer</option>
                  <option value="Self Direct">Self Direct</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-tma-makeAndModel">Old Vehicle Make & Model</label>
                <input type="text" id="inp-tma-makeAndModel" data-field="makeAndModel">
              </div>
              <div class="form-field">
                <label for="inp-tma-regNumber">Old Reg Number</label>
                <input type="text" id="inp-tma-regNumber" data-field="regNumber">
              </div>
              <div class="form-field form-group-full">
                <label for="inp-tma-tmaRemark">TMA Valuation Remark</label>
                <input type="text" id="inp-tma-tmaRemark" data-field="tmaRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>TMA Status *</label>
                <div class="quick-status-buttons" id="quick-status-tma">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-tma-tmaStatus" data-field="tmaStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>TMA Timestamp (Auto)</label>
                <input type="text" id="inp-tma-tmaTimestamp" data-field="tmaTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- TALLY FILE SECTION -->
          <div class="form-section-block" data-section="file" id="sec-file">
            <div class="form-section-header">
              <h4>Tally File Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field quick-status-group">
                <label>Tally File Status *</label>
                <div class="quick-status-buttons" id="quick-status-file">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-file-fileStatus" data-field="fileStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>File Timestamp (Auto)</label>
                <input type="text" id="inp-file-fileTimestamp" data-field="fileTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- ACCOUNTS DETAILS BLOCK -->
          <div class="form-section-block" data-section="accounts" id="sec-accounts">
            <div class="form-section-header">
              <h4>Accounts Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-accounts-tallyDate">Tally Voucher Date</label>
                <input type="date" id="inp-accounts-tallyDate" data-field="tallyDate">
              </div>
              <div class="form-field">
                <label for="inp-accounts-accountsRemark">Accounts Remark</label>
                <input type="text" id="inp-accounts-accountsRemark" data-field="accountsRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>Accounts Status *</label>
                <div class="quick-status-buttons" id="quick-status-accounts">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-accounts-accountsStatus" data-field="accountsStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>Accounts Timestamp (Auto)</label>
                <input type="text" id="inp-accounts-accountsTimestamp" data-field="accountsTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- INSURANCE DETAILS BLOCK -->
          <div class="form-section-block" data-section="insurance" id="sec-insurance">
            <div class="form-section-header">
              <h4>Insurance Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-insurance-insuranceType">Insurance Type *</label>
                <select id="inp-insurance-insuranceType" data-field="insuranceType">
                  <option value="In-House (Tata Motors)">In-House (Tata Motors)</option>
                  <option value="Outside Broker">Outside Broker</option>
                  <option value="Corporate Multi-Year">Corporate Multi-Year</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-insurance-insuranceRemark">Insurance Remark</label>
                <input type="text" id="inp-insurance-insuranceRemark" data-field="insuranceRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>Insurance Status *</label>
                <div class="quick-status-buttons" id="quick-status-insurance">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-insurance-insuranceStatus" data-field="insuranceStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>Insurance Timestamp (Auto)</label>
                <input type="text" id="inp-insurance-insuranceTimestamp" data-field="insuranceTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- REGISTRATION DETAILS BLOCK -->
          <div class="form-section-block" data-section="registration" id="sec-registration">
            <div class="form-section-header">
              <h4>Registration Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-registration-registrationType">Registration Type *</label>
                <select id="inp-registration-registrationType" data-field="registrationType">
                  <option value="Permanent">Permanent</option>
                  <option value="Temporary">Temporary</option>
                  <option value="BH Series">BH Series</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-registration-applicationNumber">Application Number</label>
                <input type="text" id="inp-registration-applicationNumber" data-field="applicationNumber">
              </div>
              <div class="form-field">
                <label for="inp-registration-taxPaidDate">Tax Paid Date</label>
                <input type="date" id="inp-registration-taxPaidDate" data-field="taxPaidDate">
              </div>
              <div class="form-field">
                <label for="inp-registration-registerNumber">Registration Number</label>
                <input type="text" id="inp-registration-registerNumber" data-field="registerNumber">
              </div>
              <div class="form-field">
                <label for="inp-registration-hsrpStatus">HSRP Status</label>
                <select id="inp-registration-hsrpStatus" data-field="hsrpStatus">
                  <option value="Not Ordered">Not Ordered</option>
                  <option value="Ordered">Ordered</option>
                  <option value="Received">Received</option>
                  <option value="Fitted">Fitted</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-registration-registrationRemark">Registration Remark</label>
                <input type="text" id="inp-registration-registrationRemark" data-field="registrationRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>Registration Status *</label>
                <div class="quick-status-buttons" id="quick-status-registration">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-registration-registrationStatus" data-field="registrationStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>Registration Timestamp (Auto)</label>
                <input type="text" id="inp-registration-registrationTimestamp" data-field="registrationTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- TMGA DETAILS BLOCK -->
          <div class="form-section-block" data-section="tmga" id="sec-tmga">
            <div class="form-section-header">
              <h4>TMGA Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-tmga-tmgaValue">TMGA Value (₹)</label>
                <input type="number" id="inp-tmga-tmgaValue" data-field="tmgaValue">
              </div>
              <div class="form-field">
                <label for="inp-tmga-vasValue">VAS Value (₹)</label>
                <input type="number" id="inp-tmga-vasValue" data-field="vasValue">
              </div>
              <div class="form-field form-group-full">
                <label for="inp-tmga-tmgaRemark">TMGA Remark</label>
                <input type="text" id="inp-tmga-tmgaRemark" data-field="tmgaRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>TMGA Status *</label>
                <div class="quick-status-buttons" id="quick-status-tmga">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-tmga-tmgaStatus" data-field="tmgaStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>TMGA Timestamp (Auto)</label>
                <input type="text" id="inp-tmga-tmgaTimestamp" data-field="tmgaTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- PDI DETAILS BLOCK -->
          <div class="form-section-block" data-section="pdi" id="sec-pdi">
            <div class="form-section-header">
              <h4>PDI Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field form-group-full">
                <label for="inp-pdi-pdiRemark">PDI Remark</label>
                <input type="text" id="inp-pdi-pdiRemark" data-field="pdiRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>PDI Status *</label>
                <div class="quick-status-buttons" id="quick-status-pdi">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-pdi-pdiStatus" data-field="pdiStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>PDI Timestamp (Auto)</label>
                <input type="text" id="inp-pdi-pdiTimestamp" data-field="pdiTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>

          <!-- DELIVERY DETAILS BLOCK -->
          <div class="form-section-block" data-section="delivery" id="sec-delivery">
            <div class="form-section-header">
              <h4>Delivery Details</h4>
              <span class="section-lock-badge">Read-Only</span>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label for="inp-delivery-expectedDeliveryDate">Expected Delivery Date</label>
                <input type="date" id="inp-delivery-expectedDeliveryDate" data-field="expectedDeliveryDate">
              </div>
              <div class="form-field">
                <label for="inp-delivery-actualDeliveryDate">Actual Delivery Date</label>
                <input type="date" id="inp-delivery-actualDeliveryDate" data-field="actualDeliveryDate">
              </div>
              <div class="form-field">
                <label for="inp-delivery-homeVisit14DayStatus">14 Day Home Visit Status</label>
                <select id="inp-delivery-homeVisit14DayStatus" data-field="homeVisit14DayStatus">
                  <option value="Not Attended">Not Attended</option>
                  <option value="Pending Schedule">Pending Schedule</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div class="form-field">
                <label for="inp-delivery-cxoRemark">CXO Delivery Remark</label>
                <input type="text" id="inp-delivery-cxoRemark" data-field="cxoRemark">
              </div>
              
              <div class="form-field quick-status-group">
                <label>Delivery Status *</label>
                <div class="quick-status-buttons" id="quick-status-delivery">
                  <button type="button" class="quick-status-btn not-attended-btn" data-value="Not Attended">Not Attended</button>
                  <button type="button" class="quick-status-btn pending-btn" data-value="Pending">Pending</button>
                  <button type="button" class="quick-status-btn approved-btn" data-value="Approved">Approved</button>
                </div>
                <input type="hidden" id="inp-delivery-deliveryStatus" data-field="deliveryStatus" value="Not Attended">
              </div>
              <div class="form-field">
                <label>Delivery Timestamp (Auto)</label>
                <input type="text" id="inp-delivery-deliveryTimestamp" data-field="deliveryTimestamp" disabled style="background-color: #f1f5f9; color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
              </div>
            </div>
          </div>
          
          <!-- Audit Remark Field -->
          <div class="form-section-block editable" style="border-color: #cbd5e1; background-color: #f8fafc;">
            <div class="form-section-header" style="margin-bottom: 8px;">
              <h4 style="color: var(--text-dark);">Change Verification Remark</h4>
            </div>
            <div class="form-field">
              <label for="inp-audit-remark">Operation Reason / Audit Remark *</label>
              <input type="text" id="inp-audit-remark" placeholder="Describe the status updates made (e.g. Loan approved, tax paid)..." required>
            </div>
          </div>

        </form>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="btn-delete-vehicle" style="border-color: #f87171; color: #dc2626; display: none;">Delete Booking</button>
          <div style="display: flex; gap: 8px; margin-left: auto;">
            <button type="button" class="btn-secondary" id="btn-cancel-drawer">Cancel</button>
            <button type="submit" form="vehicle-form" class="btn-primary" id="btn-save-drawer">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 7. CUSTOM POPUP DIALOG (Prompt/Confirm Replacement) -->
    <div class="modal-overlay" id="custom-dialog-overlay" style="display: none; align-items: center; justify-content: center; z-index: 2000; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);">
      <div class="modal-drawer" style="width: 100%; max-width: 400px; height: auto !important; padding: 24px; border-radius: 12px; border: 1px solid var(--border-light); transform: scale(0.95); transition: transform 0.2s ease, opacity 0.2s ease; box-shadow: var(--shadow-xl); background: var(--bg-card);">
        <h3 id="dialog-title" style="margin-bottom: 12px; color: var(--primary-navy); font-weight: 700; font-size: 1.2rem;">Dialog Title</h3>
        <p id="dialog-message" style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 18px; line-height: 1.5;"></p>
        
        <div id="dialog-input-container" style="margin-bottom: 18px; display: none;">
          <input type="text" id="dialog-input" placeholder="Enter value..." style="width: 100%; padding: 10px 14px; border: 1.5px solid var(--border-light); border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s ease; background-color: var(--bg-body); color: var(--text-dark);">
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn-secondary" id="btn-dialog-cancel" style="padding: 8px 16px; font-size: 0.85rem; border-radius: 6px;">Cancel</button>
          <button type="button" class="btn-primary" id="btn-dialog-confirm" style="padding: 8px 16px; font-size: 0.85rem; border-radius: 6px;">Confirm</button>
        </div>
      </div>
    </div>

    <!-- 6. REAL-TIME TOASTS CONTAINER -->
    <div class="toast-container" id="toast-container">
      <!-- Toasts inserted dynamically -->
    </div>

  </div>

  <!-- Javascript Modules -->
  
`;
      initApp();
      containerRef.current.hasInit = true;
    }
  }, []);

  return <div ref={containerRef}></div>;
}
