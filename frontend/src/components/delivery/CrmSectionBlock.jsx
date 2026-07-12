// CRM FORM — Delivery Master List
// This file controls the CRM entry form shown when clicking "CRM" in the Delivery Master List.
// It is COMPLETELY SEPARATE from the Booking form (BookingSectionBlock.jsx).
// Do NOT share this file's access config with the booking form.

import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { STATUS_VALUES, SECTIONS } from '../../models/apiModel.js';

// ============================================================
// CRM FORM — ROLE-BASED ACCESS CONTROL CONFIGURATION
// ============================================================
// To grant a role access to a section div: add the role name to the section's array.
// To grant a role access to a specific field: add/edit the field entry in CRM_FIELD_ACCESS.
// Field-level access overrides the section-level access for that specific field.

// Section-level access: controls which roles can edit fields in each section card div
const CRM_SECTION_ACCESS = {
  'CRM CUSTOMER':   ['BOOKING IN-CHARGE', 'CRM'],     // CRM Customer Details div
  'CRM VEHICLE':    ['BOOKING IN-CHARGE', 'CRM'],     // CRM Vehicle Details div
  'CRM SALES':      ['BOOKING IN-CHARGE', 'CRM'],     // CRM Sales Details div
  'CRM OFFER':      ['BOOKING IN-CHARGE', 'CRM'],     // CRM Offer Details div
  'CRM FINANCE':    ['FINANCE'],                       // CRM Finance Details div
  'CRM TMA':        ['TMA'],                           // CRM TMA Details div
  'CRM TALLY FILE': ['ACCOUNTS'],                      // CRM Tally File Details div
  'CRM ACCOUNTS':   ['ACCOUNTS'],                      // CRM Accounts Details div
  'CRM INSURANCE':  ['INSURANCE'],                     // CRM Insurance Details div
  'CRM REGISTRATION': ['REGISTRATION'],                // CRM Registration Details div
  'CRM TMGA':       ['TMGA'],                          // CRM TMGA Details div
  'CRM PDI':        ['PDI'],                           // CRM PDI Details div
  'CRM DELIVERY':   ['DELIVERY'],                      // CRM Delivery Details div
};

// Field-level access: add ONLY fields that need different access than their section div default
const CRM_FIELD_ACCESS = {

  // ── CRM Customer Details div ──
  // Section default: ['BOOKING IN-CHARGE', 'CRM']
  'date':         ['BOOKING IN-CHARGE'],
  'customername': ['BOOKING IN-CHARGE'],
  'mobilenumber': ['BOOKING IN-CHARGE'],
  'optyid':       ['BOOKING IN-CHARGE'],
  'ordernumber':  ['CRM'],
  'saporderno':   ['CRM'],
  // invoicenumber, source, year → use section default

  // ── CRM Vehicle Details div ──
  // Section default: ['BOOKING IN-CHARGE', 'CRM']
  'pl':       ['BOOKING IN-CHARGE'],
  'variant':  ['BOOKING IN-CHARGE'],
  'colour':   ['BOOKING IN-CHARGE'],
  'bostatus': ['CRM'],
  'bodate':   ['CRM'],
  // vehiclestatus, fuel, vc → use section default
  // chassisnumber → handled separately by isChassisLocked

  // ── CRM Sales Details div ──
  // Section default: ['BOOKING IN-CHARGE', 'CRM']
  'ca':               ['BOOKING IN-CHARGE'],
  'tl':               ['BOOKING IN-CHARGE'],
  'branch':           ['BOOKING IN-CHARGE'],
  'region':           ['BOOKING IN-CHARGE'],
  'crmbookingstatus': ['BOOKING IN-CHARGE'],
  'branchstatus':     [],   // view-only for everyone except ADMIN
  'branchremark':     [],   // view-only for everyone except ADMIN

  // ── CRM Offer Details div ──
  // No overrides — all offer fields use section default ['BOOKING IN-CHARGE', 'CRM']

  // ── CRM Finance Details div ──
  // Section default: ['FINANCE']
  'financestatus': ['FINANCE'],
  'financeremark': ['FINANCE'],
  // All other finance fields use section default
};

// Map original section titles (from SECTIONS in constants.js) to CRM section names
const SECTION_TITLE_MAP = {
  'Customer Details':     'CRM CUSTOMER',
  'Vehicle Details':      'CRM VEHICLE',
  'Sales Details':        'CRM SALES',
  'Offer Details':        'CRM OFFER',
  'Finance Details':      'CRM FINANCE',
  'TMA Details':          'CRM TMA',
  'Tally File Details':   'CRM TALLY FILE',
  'Accounts Details':     'CRM ACCOUNTS',
  'Insurance Details':    'CRM INSURANCE',
  'Registration Details': 'CRM REGISTRATION',
  'TMGA Details':         'CRM TMGA',
  'PDI Details':          'CRM PDI',
  'Delivery Details':     'CRM DELIVERY',
};

export default function CrmSectionBlock({ formData, handleChange, branches = [] }) {
  const { user } = useAuth();
  const containerRef = useRef(null);

  const getHighlightStyle = (isDisabled) => {
    if (isDisabled) return {};
    return {
      border: '1.5px solid #003b71',
      boxShadow: '0 0 4px rgba(0, 59, 113, 0.15)',
      outline: 'none',
      backgroundColor: '#fcfdfe'
    };
  };

  // Auto-scroll to first editable field when drawer opens
  useEffect(() => {
    if (containerRef.current) {
      const firstEditable = containerRef.current.querySelector('input:not([disabled]), select:not([disabled])');
      if (firstEditable) {
        const timer = setTimeout(() => {
          firstEditable.focus({ preventScroll: true });
          firstEditable.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.role]);

  const renderField = (field, sectionKey) => {
    const fieldNameLower = field.name.toLowerCase();
    const crmSectionKey = SECTION_TITLE_MAP[field.sectionTitle] || field.sectionTitle.toUpperCase();

    const isFieldDisabled = (() => {
      if (user?.role === 'ADMIN') return false;

      // Check field-level override first
      if (CRM_FIELD_ACCESS[fieldNameLower]) {
        return !CRM_FIELD_ACCESS[fieldNameLower].includes(user?.role);
      }

      // Fall back to section-level access
      const allowedRoles = CRM_SECTION_ACCESS[crmSectionKey];
      if (!allowedRoles) return true;
      return !allowedRoles.includes(user?.role);
    })();

    // Chassis number is locked unless admin / CRM / booking-in-charge
    const isChassisLocked = field.name === 'chassisNumber' &&
      !(user?.role === 'ADMIN' || user?.role === 'CRM' || user?.role === 'BOOKING IN-CHARGE');

    const finalDisabled = isFieldDisabled || isChassisLocked;
    const highlightStyle = getHighlightStyle(finalDisabled);

    if (field.type === 'status' || field.type === 'select' || field.name === 'branch') {
      let options = field.options || Object.values(STATUS_VALUES);
      if (field.name === 'branch') options = branches;
      return (
        <div key={field.name} className="form-field">
          <label>{field.label} {field.required ? '*' : ''}</label>
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required && !finalDisabled}
            disabled={finalDisabled}
            style={highlightStyle}
          >
            <option value="" disabled>Select...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name} className="form-field">
        <label>{field.label} {field.required ? '*' : ''}</label>
        <input
          type={field.type}
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
          required={field.required && !finalDisabled}
          disabled={finalDisabled}
          placeholder={field.type === 'text' ? 'Enter details...' : ''}
          style={highlightStyle}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="sections-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {Object.keys(SECTIONS).map(sectionKey => {
        const section = SECTIONS[sectionKey];
        const crmTitle = SECTION_TITLE_MAP[section.title] || `CRM ${section.title.toUpperCase()}`;
        return (
          <div key={sectionKey} className="section-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>
              CRM {section.title}
            </h4>
            <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
              {section.fields.map(field => {
                const fieldWithMeta = { ...field, sectionKey, sectionTitle: section.title };
                return renderField(fieldWithMeta, sectionKey);
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
