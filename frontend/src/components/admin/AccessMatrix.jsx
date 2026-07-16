import React, { useState } from 'react';
import { saveBackendSettings } from '../../models/apiModel.js';

// ─── All known roles (same list as UserAdmin role options) ───────────────────
const ALL_ROLES = [
  'BOOKING IN-CHARGE',
  'CRM',
  'BRANCH',
  'BRANCH_MANAGER',
  'FINANCE',
  'TMA',
  'ACCOUNTS',
  'INSURANCE',
  'REGISTRATION',
  'TMGA',
  'PDI',
  'DELIVERY',
  'MANAGEMENT',
];

// ─── BOOKING FORM access data (mirrors BookingSectionBlock constants exactly) ─
const BOOKING_SECTION_ACCESS = {
  'BOOKING CUSTOMER': ['BOOKING IN-CHARGE', 'CRM'],
  'BOOKING VEHICLE': ['BOOKING IN-CHARGE', 'CRM'],
  'BOOKING SALES': ['BOOKING IN-CHARGE', 'CRM'],
  'BOOKING OFFER': ['BOOKING IN-CHARGE', 'CRM'],
  'BOOKING FINANCE': ['FINANCE'],
  'BOOKING ACTIONS': ['BOOKING IN-CHARGE', 'BRANCH', 'BRANCH_MANAGER'],
};

const BOOKING_FIELD_ACCESS = {
  'date': ['BOOKING IN-CHARGE', 'BRANCH'],
  'customername': ['BOOKING IN-CHARGE', 'BRANCH'],
  'mobilenumber': ['BOOKING IN-CHARGE', 'BRANCH'],
  'optyid': ['BOOKING IN-CHARGE', 'BRANCH'],
  'ordernumber': ['CRM'],
  'saporderno': ['CRM'],
  'pl': ['BOOKING IN-CHARGE', 'BRANCH'],
  'variant': ['BOOKING IN-CHARGE', 'BRANCH'],
  'colour': ['BOOKING IN-CHARGE', 'BRANCH'],
  'bostatus': ['CRM'],
  'bodate': ['CRM'],
  'ca': ['BOOKING IN-CHARGE', 'BRANCH'],
  'tl': ['BOOKING IN-CHARGE', 'BRANCH'],
  'branch': ['BOOKING IN-CHARGE'],
  'region': ['BOOKING IN-CHARGE', 'BRANCH'],
  'crmbookingstatus': ['BOOKING IN-CHARGE'],
  'branchstatus': ['BRANCH_MANAGER', 'BRANCH'],
  'branchremark': ['BRANCH_MANAGER', 'BRANCH'],
  'financestatus': ['FINANCE'],
  'financeremark': ['FINANCE'],
  'btn_new_booking': ['BOOKING IN-CHARGE', 'BRANCH', 'BRANCH_MANAGER'],
};

const BOOKING_GROUPS = [
  {
    section: 'BOOKING ACTIONS',
    title: 'Booking Quick Actions',
    fields: [
      { key: 'btn_new_booking', label: 'New Booking Button' }
    ]
  },
  {
    section: 'BOOKING CUSTOMER',
    title: 'Customer & Booking Details',
    fields: [
      { key: 'date', label: 'Booking Date' },
      { key: 'customername', label: 'Customer Name' },
      { key: 'mobilenumber', label: 'Mobile Number' },
      { key: 'optyid', label: 'OPTY ID' },
    ],
  },
  {
    section: 'BOOKING VEHICLE',
    title: 'Vehicle Details',
    fields: [
      { key: 'pl', label: 'PPL (Product Line)' },
      { key: 'variant', label: 'Variant' },
      { key: 'colour', label: 'Color' },
    ],
  },
  {
    section: 'BOOKING SALES',
    title: 'Sales & Branch Routing',
    fields: [
      { key: 'ca', label: 'Customer Advisor (CA)' },
      { key: 'tl', label: 'Team Leader (TL)' },
      { key: 'branch', label: 'Branch' },
      { key: 'region', label: 'Region' },
      { key: 'crmbookingstatus', label: 'CRM Booking Status' },
    ],
  },
  {
    section: 'BOOKING CUSTOMER',
    title: 'CRM Verification Details',
    fields: [
      { key: 'bostatus', label: 'BO Status' },
      { key: 'bodate', label: 'BO Date' },
      { key: 'ordernumber', label: 'BKG Order No' },
      { key: 'saporderno', label: 'SAP Order No' },
    ],
  },
  {
    section: 'BOOKING SALES',
    title: 'Branch Approval Remarks',
    fields: [
      { key: 'branchstatus', label: 'Branch Status' },
      { key: 'branchremark', label: 'Branch Remark' },
    ],
  },
  {
    section: 'BOOKING FINANCE',
    title: 'Finance Status Details',
    fields: [
      { key: 'financestatus', label: 'Finance Status' },
      { key: 'financeremark', label: 'Finance Remark' },
    ],
  },
];

// ─── CRM FORM access data (mirrors CrmSectionBlock constants exactly) ─────────
const CRM_SECTION_ACCESS = {
  'CRM CUSTOMER': ['BOOKING IN-CHARGE', 'CRM'],
  'CRM VEHICLE': ['BOOKING IN-CHARGE', 'CRM'],
  'CRM SALES': ['BOOKING IN-CHARGE', 'CRM'],
  'CRM OFFER': ['BOOKING IN-CHARGE', 'CRM'],
  'CRM FINANCE': ['FINANCE', 'CRM'],
  'CRM TMA': ['TMA', 'CRM'],
  'CRM TALLY FILE': ['ACCOUNTS', 'CRM'],
  'CRM ACCOUNTS': ['ACCOUNTS', 'CRM'],
  'CRM INSURANCE': ['INSURANCE', 'CRM'],
  'CRM REGISTRATION': ['REGISTRATION', 'CRM'],
  'CRM TMGA': ['TMGA', 'CRM'],
  'CRM PDI': ['PDI', 'CRM'],
  'CRM DELIVERY': ['DELIVERY', 'CRM'],
  'CRM ACTIONS': ['BOOKING IN-CHARGE', 'CRM'],
};

const CRM_FIELD_ACCESS = {
  'date': ['BOOKING IN-CHARGE', 'CRM'],
  'customername': ['BOOKING IN-CHARGE', 'CRM'],
  'mobilenumber': ['BOOKING IN-CHARGE', 'CRM'],
  'optyid': ['BOOKING IN-CHARGE', 'CRM'],
  'ordernumber': ['CRM'],
  'saporderno': ['CRM'],
  'invoicenumber': ['CRM'],
  'source': ['BOOKING IN-CHARGE', 'CRM'],
  'year': ['BOOKING IN-CHARGE', 'CRM'],
  'pl': ['BOOKING IN-CHARGE', 'CRM'],
  'variant': ['BOOKING IN-CHARGE', 'CRM'],
  'colour': ['BOOKING IN-CHARGE', 'CRM'],
  'bostatus': ['CRM'],
  'bodate': ['CRM'],
  'vehiclestatus': ['BOOKING IN-CHARGE', 'CRM'],
  'chassisnumber': ['BOOKING IN-CHARGE', 'CRM'],
  'fuel': ['BOOKING IN-CHARGE', 'CRM'],
  'vc': ['BOOKING IN-CHARGE', 'CRM'],
  'ca': ['BOOKING IN-CHARGE', 'CRM'],
  'tl': ['BOOKING IN-CHARGE', 'CRM'],
  'branch': ['BOOKING IN-CHARGE', 'CRM'],
  'region': ['BOOKING IN-CHARGE', 'CRM'],
  'crmbookingstatus': ['BOOKING IN-CHARGE', 'CRM'],
  'branchstatus': ['CRM'],
  'branchremark': ['CRM'],
  'financestatus': ['FINANCE', 'CRM'],
  'financeremark': ['FINANCE', 'CRM'],
  'btn_crm_form': ['BOOKING IN-CHARGE', 'CRM'],
};

const CRM_GROUPS = [
  {
    section: 'CRM ACTIONS',
    title: 'CRM Quick Actions',
    fields: [
      { key: 'btn_crm_form', label: 'CRM Button' }
    ]
  },
  {
    section: 'CRM CUSTOMER',
    title: 'CRM Customer Details',
    fields: [
      { key: 'date', label: 'Booking Date' },
      { key: 'customername', label: 'Customer Name' },
      { key: 'mobilenumber', label: 'Mobile Number' },
      { key: 'optyid', label: 'OPTY ID' },
      { key: 'ordernumber', label: 'BKG Order No' },
      { key: 'saporderno', label: 'SAP Order No' },
      { key: 'invoicenumber', label: 'Invoice Number' },
      { key: 'source', label: 'Booking Source' },
      { key: 'year', label: 'Manufacturing Year' },
    ],
  },
  {
    section: 'CRM VEHICLE',
    title: 'CRM Vehicle Details',
    fields: [
      { key: 'vehiclestatus', label: 'Vehicle Status' },
      { key: 'chassisnumber', label: 'Chassis Number' },
      { key: 'fuel', label: 'Fuel Type' },
      { key: 'pl', label: 'PPL (Product Line)' },
      { key: 'variant', label: 'Variant' },
      { key: 'colour', label: 'Color' },
      { key: 'bostatus', label: 'BO Status' },
      { key: 'bodate', label: 'BO Date' },
      { key: 'vc', label: 'Vehicle Code (VC)' },
    ],
  },
  {
    section: 'CRM SALES',
    title: 'CRM Sales Details',
    fields: [
      { key: 'ca', label: 'Customer Advisor (CA)' },
      { key: 'tl', label: 'Team Leader (TL)' },
      { key: 'branch', label: 'Branch' },
      { key: 'region', label: 'Region' },
      { key: 'crmbookingstatus', label: 'CRM Booking Status' },
      { key: 'branchstatus', label: 'Branch Status' },
      { key: 'branchremark', label: 'Branch Remark' },
    ],
  },
  {
    section: 'CRM OFFER',
    title: 'CRM Offer Details',
    fields: [
      { key: 'hypothecation', label: 'Hypothecation (Bank/Self)' },
      { key: 'cashdiscount', label: 'Cash Discount / Green Bonus (₹)' },
      { key: 'exchangeloyalty', label: 'Exchange / Loyalty (₹)' },
      { key: 'corporate', label: 'Corporate Discount (₹)' },
      { key: 'sss', label: 'SSS Discount (₹)' },
      { key: 'kpkb', label: 'KPKB / Special Scheme (₹)' },
      { key: 'solaroffer', label: 'Solar Offer (₹)' },
      { key: 'pricedifference', label: 'Price Difference (₹)' },
      { key: 'offerremark', label: 'Offer Remark' },
    ],
  },
  {
    section: 'CRM FINANCE',
    title: 'CRM Finance Details',
    fields: [
      { key: 'financetype', label: 'Finance Type' },
      { key: 'onroadprice', label: 'On Road Price' },
      { key: 'ip', label: 'Initial Payment (IP)' },
      { key: 'loanamount', label: 'Loan Amount' },
      { key: 'balanceamount', label: 'Balance Amount' },
      { key: 'fundpercentage', label: 'Fund Percentage' },
      { key: 'loanamountstatus', label: 'Loan Amount Status' },
      { key: 'financestatus', label: 'Finance Status' },
      { key: 'financeremark', label: 'Finance Remark' },
      { key: 'financetimestamp', label: 'Finance Timestamp' },
    ],
  },
  {
    section: 'CRM TMA',
    title: 'CRM TMA Details',
    fields: [
      { key: 'exchangeyesno', label: 'Exchange (Yes/No)' },
      { key: 'tmatype', label: 'TMA Type' },
      { key: 'makeandmodel', label: 'Make and Model' },
      { key: 'regnumber', label: 'Reg Number' },
      { key: 'tmastatus', label: 'TMA Status' },
      { key: 'tmaremark', label: 'TMA Remark' },
      { key: 'tmatimestamp', label: 'TMA Timestamp' },
    ],
  },
  {
    section: 'CRM TALLY FILE',
    title: 'CRM Tally File Details',
    fields: [
      { key: 'filestatus', label: 'Tally File Status' },
      { key: 'filetimestamp', label: 'File Timestamp' },
    ],
  },
  {
    section: 'CRM ACCOUNTS',
    title: 'CRM Accounts Details',
    fields: [
      { key: 'tallydate', label: 'Tally Voucher Date' },
      { key: 'accountsstatus', label: 'Accounts Status' },
      { key: 'accountsremark', label: 'Accounts Remark' },
      { key: 'accountstimestamp', label: 'Accounts Timestamp' },
    ],
  },
  {
    section: 'CRM INSURANCE',
    title: 'CRM Insurance Details',
    fields: [
      { key: 'insurancetype', label: 'Insurance Type' },
      { key: 'insurancestatus', label: 'Insurance Status' },
      { key: 'insuranceremark', label: 'Insurance Remark' },
      { key: 'insurancetimestamp', label: 'Insurance Timestamp' },
    ],
  },
  {
    section: 'CRM REGISTRATION',
    title: 'CRM Registration Details',
    fields: [
      { key: 'registrationtype', label: 'Registration Type' },
      { key: 'applicationnumber', label: 'Application Number' },
      { key: 'taxpaiddate', label: 'Tax Paid Date' },
      { key: 'registernumber', label: 'Registration Number' },
      { key: 'hsrpstatus', label: 'HSRP Status' },
      { key: 'registrationstatus', label: 'Registration Status' },
      { key: 'registrationremark', label: 'Registration Remark' },
      { key: 'registrationtimestamp', label: 'Registration Timestamp' },
    ],
  },
  {
    section: 'CRM TMGA',
    title: 'CRM TMGA Details',
    fields: [
      { key: 'tmgavalue', label: 'TMGA Value' },
      { key: 'vasvalue', label: 'VAS Value' },
      { key: 'tmgastatus', label: 'TMGA Status' },
      { key: 'tmgaremark', label: 'TMGA Remark' },
      { key: 'tmgatimestamp', label: 'TMGA Timestamp' },
    ],
  },
  {
    section: 'CRM PDI',
    title: 'CRM PDI Details',
    fields: [
      { key: 'pdistatus', label: 'PDI Status' },
      { key: 'pdiremark', label: 'PDI Assessment Remark' },
      { key: 'pditimestamp', label: 'PDI Timestamp' },
    ],
  },
  {
    section: 'CRM DELIVERY',
    title: 'CRM Delivery Details',
    fields: [
      { key: 'expecteddeliverydate', label: 'Expected Delivery Date' },
      { key: 'actualdeliverydate', label: 'Actual Delivery Date' },
      { key: 'homevisit14daystatus', label: '14 Day Home Visit Status' },
      { key: 'deliverystatus', label: 'Delivery Status' },
      { key: 'cxoremark', label: 'CXO Delivery Remark' },
      { key: 'deliverytimestamp', label: 'Delivery Timestamp' },
    ],
  }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function resolveAccess(fieldKey, sectionKey, fieldAccessMap, sectionAccessMap) {
  const fieldRoles = fieldAccessMap[fieldKey];
  const sectionRoles = sectionAccessMap[sectionKey];
  return fieldRoles ?? sectionRoles ?? [];
}

export function getPermission(settings, formType, fieldKey, sectionKey, role, fieldAccessMap = (formType === 'booking' ? BOOKING_FIELD_ACCESS : CRM_FIELD_ACCESS), sectionAccessMap = (formType === 'booking' ? BOOKING_SECTION_ACCESS : CRM_SECTION_ACCESS)) {
  const userRoles = typeof role === 'string' ? role.split(',').map(r => r.trim()) : [role];

  // If we have custom settings saved in DB, check them for each role
  let customPerm = null;
  for (const r of userRoles) {
    if (settings?.role_permissions?.[formType]?.[fieldKey]?.[r] !== undefined) {
      const p = settings.role_permissions[formType][fieldKey][r];
      if (!customPerm) {
        customPerm = { view: p.view, edit: p.edit };
      } else {
        customPerm.view = customPerm.view || p.view;
        customPerm.edit = customPerm.edit || p.edit;
      }
    }
  }
  if (customPerm) return customPerm;

  // Otherwise, fallback to initial default logic from static constants
  const editRoles = resolveAccess(fieldKey, sectionKey, fieldAccessMap, sectionAccessMap);
  const canEditDefault = userRoles.includes('ADMIN') || editRoles.some(r => userRoles.includes(r));

  // By default, everyone has View access to all fields unless overridden.
  // Action buttons, however, are hidden by default unless the role is an allowed editor.
  let canViewDefault = true;
  if (fieldKey === 'btn_new_booking' || fieldKey === 'btn_crm_form') {
    canViewDefault = userRoles.includes('ADMIN') || editRoles.some(r => userRoles.includes(r));
  }

  return {
    view: canViewDefault,
    edit: canEditDefault
  };
}

const FIELD_COL_WIDTH = '260px';
const ROLE_COL_WIDTH = '140px';

function SectionHeader({ title, sectionKey, sectionAccessMap }) {
  const editRoles = sectionAccessMap[sectionKey] ?? [];
  return (
    <tr>
      <td
        style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e3a5f 100%)',
          color: '#fff', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.6px',
          padding: '10px 16px', textTransform: 'uppercase',
          position: 'sticky', left: 0, zIndex: 2,
          boxShadow: '2px 0 4px rgba(0,0,0,0.06)',
          width: FIELD_COL_WIDTH,
          minWidth: FIELD_COL_WIDTH,
          maxWidth: FIELD_COL_WIDTH,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {title}
      </td>
      <td
        colSpan={ALL_ROLES.length}
        style={{
          background: '#1e3a5f',
          color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, fontSize: '0.7rem',
          padding: '10px 16px', textTransform: 'uppercase',
          textAlign: 'left'
        }}
      >
        Section default editors: {editRoles.length ? editRoles.join(', ') : 'ADMIN only'}
      </td>
    </tr>
  );
}

function MatrixTable({ formType, groups, fieldAccessMap, sectionAccessMap, settings, setSettings, isReadOnly }) {

  const handleToggle = async (fieldKey, sectionKey, role, type) => {
    if (isReadOnly || role === 'ADMIN') return;

    // Deep clone the permissions object or start fresh
    const newPermissions = JSON.parse(JSON.stringify(settings?.role_permissions || {}));
    if (!newPermissions[formType]) newPermissions[formType] = {};
    if (!newPermissions[formType][fieldKey]) newPermissions[formType][fieldKey] = {};

    // Resolve current permission status
    const current = getPermission(settings, formType, fieldKey, sectionKey, role, fieldAccessMap, sectionAccessMap);

    const nextVal = !current[type];

    // Initialize role key in nested object
    newPermissions[formType][fieldKey][role] = {
      view: current.view,
      edit: current.edit,
      [type]: nextVal
    };

    // UX rules:
    if (type === 'view' && !nextVal) {
      // Hide active -> disable Edit as well
      newPermissions[formType][fieldKey][role].edit = false;
    }
    if (type === 'edit' && nextVal) {
      // Edit active -> enable View automatically
      newPermissions[formType][fieldKey][role].view = true;
    }

    // Save to settings db
    try {
      const updatedSettings = await saveBackendSettings({
        ...settings,
        role_permissions: newPermissions
      });
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Failed to save permissions:', err);
    }
  };

  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', borderBottom: '2px solid #e2e8f0', width: FIELD_COL_WIDTH, minWidth: FIELD_COL_WIDTH, maxWidth: FIELD_COL_WIDTH, position: 'sticky', left: 0, background: '#f1f5f9', zIndex: 3, boxShadow: '2px 0 4px rgba(0,0,0,0.06)' }}>
              Field
            </th>
            {ALL_ROLES.map(role => (
              <th key={role} style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', width: ROLE_COL_WIDTH, minWidth: ROLE_COL_WIDTH, maxWidth: ROLE_COL_WIDTH }}>
                {role.replace('_', ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              <SectionHeader title={group.title} sectionKey={group.section} sectionAccessMap={sectionAccessMap} />
              {group.fields.length === 0 ? (
                <tr>
                  <td style={{ padding: '10px 16px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem', borderBottom: '1px solid #f1f5f9', position: 'sticky', left: 0, background: '#fff', zIndex: 1, boxShadow: '2px 0 4px rgba(0,0,0,0.04)', width: FIELD_COL_WIDTH, minWidth: FIELD_COL_WIDTH, maxWidth: FIELD_COL_WIDTH }}>
                    All fields use section-level access
                  </td>
                  {ALL_ROLES.map(role => {
                    // When fields list is empty, we handle the Section defaults
                    // Treat this row as a virtual section field
                    const perm = getPermission(settings, formType, `section:${group.section}`, group.section, role, fieldAccessMap, sectionAccessMap);

                    return (
                      <td key={role} style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', background: gi % 2 === 0 ? '#fafafa' : '#fff', width: ROLE_COL_WIDTH, minWidth: ROLE_COL_WIDTH, maxWidth: ROLE_COL_WIDTH }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                          <button
                            disabled={isReadOnly || role === 'ADMIN'}
                            onClick={() => handleToggle(`section:${group.section}`, group.section, role, 'view')}
                            style={{
                              padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid', cursor: (isReadOnly || role === 'ADMIN') ? 'default' : 'pointer', width: '70px', textAlign: 'center',
                              backgroundColor: perm.view ? 'rgba(59,130,246,0.08)' : '#f1f5f9',
                              color: perm.view ? '#2563eb' : '#64748b',
                              borderColor: perm.view ? '#93c5fd' : '#cbd5e1',
                              transition: 'all 0.1s'
                            }}
                          >
                            {perm.view ? '👁 View' : '✕ Hide'}
                          </button>
                          <button
                            disabled={isReadOnly || role === 'ADMIN'}
                            onClick={() => handleToggle(`section:${group.section}`, group.section, role, 'edit')}
                            style={{
                              padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid', cursor: (isReadOnly || role === 'ADMIN') ? 'default' : 'pointer', width: '70px', textAlign: 'center',
                              backgroundColor: perm.edit ? 'rgba(34,197,94,0.08)' : '#f1f5f9',
                              color: perm.edit ? '#16a34a' : '#64748b',
                              borderColor: perm.edit ? '#86efac' : '#cbd5e1',
                              transition: 'all 0.1s'
                            }}
                          >
                            {perm.edit ? '✎ Edit' : '🔒 Lock'}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ) : (
                group.fields.map((field, fi) => {
                  const isFieldOverride = fieldAccessMap[field.key] !== undefined;
                  const rowBg = fi % 2 === 0 ? '#fafafa' : '#fff';

                  return (
                    <tr key={field.key} style={{ background: rowBg }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0f172a', borderBottom: '1px solid #f1f5f9', position: 'sticky', left: 0, background: rowBg, zIndex: 1, boxShadow: '2px 0 4px rgba(0,0,0,0.04)', width: FIELD_COL_WIDTH, minWidth: FIELD_COL_WIDTH, maxWidth: FIELD_COL_WIDTH, whiteSpace: 'nowrap' }}>
                        {field.label}
                        {isFieldOverride && (
                          <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', fontWeight: 600 }}>
                            field rule
                          </span>
                        )}
                      </td>
                      {ALL_ROLES.map(role => {
                        const cellPerm = getPermission(settings, formType, field.key, group.section, role, fieldAccessMap, sectionAccessMap);
                        return (
                          <td key={role} style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', width: ROLE_COL_WIDTH, minWidth: ROLE_COL_WIDTH, maxWidth: ROLE_COL_WIDTH }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                              <button
                                disabled={isReadOnly || (role === 'ADMIN' && field.key !== 'btn_new_booking' && field.key !== 'btn_crm_form')}
                                onClick={() => handleToggle(field.key, group.section, role, 'view')}
                                style={{
                                  padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid', cursor: (isReadOnly || (role === 'ADMIN' && field.key !== 'btn_new_booking' && field.key !== 'btn_crm_form')) ? 'default' : 'pointer', width: '70px', textAlign: 'center',
                                  backgroundColor: cellPerm.view ? 'rgba(59,130,246,0.08)' : '#f1f5f9',
                                  color: cellPerm.view ? '#2563eb' : '#64748b',
                                  borderColor: cellPerm.view ? '#93c5fd' : '#cbd5e1',
                                  transition: 'all 0.1s'
                                }}
                              >
                                {cellPerm.view ? '👁 View' : '✕ Hide'}
                              </button>
                              {field.key !== 'btn_new_booking' && field.key !== 'btn_crm_form' && (
                                <button
                                  disabled={isReadOnly || (role === 'ADMIN' && field.key !== 'btn_new_booking' && field.key !== 'btn_crm_form')}
                                  onClick={() => handleToggle(field.key, group.section, role, 'edit')}
                                  style={{
                                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid', cursor: (isReadOnly || (role === 'ADMIN' && field.key !== 'btn_new_booking' && field.key !== 'btn_crm_form')) ? 'default' : 'pointer', width: '70px', textAlign: 'center',
                                    backgroundColor: cellPerm.edit ? 'rgba(34,197,94,0.08)' : '#f1f5f9',
                                    color: cellPerm.edit ? '#16a34a' : '#64748b',
                                    borderColor: cellPerm.edit ? '#86efac' : '#cbd5e1',
                                    transition: 'all 0.1s'
                                  }}
                                >
                                  {cellPerm.edit ? '✎ Edit' : '🔒 Lock'}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AccessMatrix({ settings, setSettings, isReadOnly = false }) {
  const [activeForm, setActiveForm] = useState('booking');

  const tabStyle = (active) => ({
    padding: '8px 20px', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem',
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: active ? '#0f172a' : 'transparent',
    color: active ? '#fff' : '#64748b',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Interactive Access Matrix</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            {isReadOnly ? 'Read-only overview of permissions.' : 'Toggle permissions directly in the table below. Changes persist instantly to the database.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button style={tabStyle(activeForm === 'booking')} onClick={() => setActiveForm('booking')}>
            Booking Form
          </button>
          <button style={tabStyle(activeForm === 'crm')} onClick={() => setActiveForm('crm')}>
            CRM Form
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LEGEND:</span>
        <button style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid #93c5fd', background: 'rgba(59,130,246,0.08)', color: '#2563eb', cursor: 'default' }}>👁 View</button>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>— Visible to role</span>
        <button style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', cursor: 'default' }}>✕ Hide</button>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>— Hidden from role</span>
        <button style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid #86efac', background: 'rgba(34,197,94,0.08)', color: '#16a34a', cursor: 'default' }}>✎ Edit</button>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>— Editable by role</span>
        <button style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', cursor: 'default' }}>🔒 Lock</button>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>— Read-only / Locked</span>
      </div>

      {/* Matrix Table */}
      {activeForm === 'booking' ? (
        <MatrixTable formType="booking" groups={BOOKING_GROUPS} fieldAccessMap={BOOKING_FIELD_ACCESS} sectionAccessMap={BOOKING_SECTION_ACCESS} settings={settings} setSettings={setSettings} isReadOnly={isReadOnly} />
      ) : (
        <MatrixTable formType="crm" groups={CRM_GROUPS} fieldAccessMap={CRM_FIELD_ACCESS} sectionAccessMap={CRM_SECTION_ACCESS} settings={settings} setSettings={setSettings} isReadOnly={isReadOnly} />
      )}
    </div>
  );
}
