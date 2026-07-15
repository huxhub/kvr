// CRM FORM — Delivery Master List
// This file controls the CRM entry form shown when clicking "CRM" in the Delivery Master List.
// It is COMPLETELY SEPARATE from the Booking form (BookingSectionBlock.jsx).
// Do NOT share this file's access config with the booking form.

import React, { useRef, useEffect, useState } from 'react';
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
  'CRM FINANCE':    ['FINANCE','CRM'],                       // CRM Finance Details div
  'CRM TMA':        ['TMA','CRM'],                           // CRM TMA Details div
  'CRM TALLY FILE': ['ACCOUNTS','CRM'],                      // CRM Tally File Details div
  'CRM ACCOUNTS':   ['ACCOUNTS','CRM'],                      // CRM Accounts Details div
  'CRM INSURANCE':  ['INSURANCE','CRM'],                     // CRM Insurance Details div
  'CRM REGISTRATION': ['REGISTRATION','CRM'],                // CRM Registration Details div
  'CRM TMGA':       ['TMGA','CRM'],                          // CRM TMGA Details div
  'CRM PDI':        ['PDI','CRM'],                           // CRM PDI Details div
  'CRM DELIVERY':   ['DELIVERY','CRM'],                      // CRM Delivery Details div
};

// Field-level access: add ONLY fields that need different access than their section div default
const CRM_FIELD_ACCESS = {

  // ── CRM Customer Details div ──
  // Section default: ['BOOKING IN-CHARGE', 'CRM']
  'date':         ['BOOKING IN-CHARGE','CRM'],
  'customername': ['BOOKING IN-CHARGE','CRM'],
  'mobilenumber': ['BOOKING IN-CHARGE','CRM'],
  'optyid':       ['BOOKING IN-CHARGE','CRM'],
  'ordernumber':  ['CRM'],
  'saporderno':   ['CRM'],
  // invoicenumber, source, year → use section default

  // ── CRM Vehicle Details div ──
  // Section default: ['BOOKING IN-CHARGE', 'CRM']
  'pl':       ['BOOKING IN-CHARGE','CRM'],
  'variant':  ['BOOKING IN-CHARGE','CRM'],
  'colour':   ['BOOKING IN-CHARGE','CRM'],
  'bostatus': ['CRM'],
  'bodate':   ['CRM'],
  // vehiclestatus, fuel, vc → use section default
  // chassisnumber → handled separately by isChassisLocked

  // ── CRM Sales Details div ──
  // Section default: ['BOOKING IN-CHARGE', 'CRM']
  'ca':               ['BOOKING IN-CHARGE','CRM'],
  'tl':               ['BOOKING IN-CHARGE','CRM'],
  'branch':           ['BOOKING IN-CHARGE','CRM'],
  'region':           ['BOOKING IN-CHARGE','CRM'],
  'crmbookingstatus': ['BOOKING IN-CHARGE','CRM'],
  'branchstatus':     ['CRM'],   // view-only for everyone except ADMIN
  'branchremark':     ['CRM'],   // view-only for everyone except ADMIN

  // ── CRM Offer Details div ──
  // No overrides — all offer fields use section default ['BOOKING IN-CHARGE', 'CRM']

  // ── CRM Finance Details div ──
  // Section default: ['FINANCE']
  'financestatus': ['FINANCE','CRM'],
  'financeremark': ['FINANCE','CRM'],
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
  const [dbSettings, setDbSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiBaseUrl}/api/settings`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setDbSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings in CrmSectionBlock:', err);
      }
    }
    loadSettings();
  }, []);

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

      // Check dynamic settings field rule first
      if (dbSettings?.role_permissions?.crm?.[fieldNameLower]?.[user?.role] !== undefined) {
        const perm = dbSettings.role_permissions.crm[fieldNameLower][user?.role];
        return !perm.edit;
      }

      // Check dynamic settings section default rule next
      if (crmSectionKey && dbSettings?.role_permissions?.crm?.[`section:${crmSectionKey}`]?.[user?.role] !== undefined) {
        const perm = dbSettings.role_permissions.crm[`section:${crmSectionKey}`][user?.role];
        return !perm.edit;
      }

      // Check field-level override first
      if (CRM_FIELD_ACCESS[fieldNameLower]) {
        return !CRM_FIELD_ACCESS[fieldNameLower].includes(user?.role);
      }

      // Fall back to section-level access
      const allowedRoles = CRM_SECTION_ACCESS[crmSectionKey];
      if (!allowedRoles) return true;
      return !allowedRoles.includes(user?.role);
    })();

    const isFieldHidden = (() => {
      if (user?.role === 'ADMIN') return false;

      // Check dynamic settings field rule first
      if (dbSettings?.role_permissions?.crm?.[fieldNameLower]?.[user?.role] !== undefined) {
        const perm = dbSettings.role_permissions.crm[fieldNameLower][user?.role];
        return !perm.view;
      }

      // Check dynamic settings section default rule next
      if (crmSectionKey && dbSettings?.role_permissions?.crm?.[`section:${crmSectionKey}`]?.[user?.role] !== undefined) {
        const perm = dbSettings.role_permissions.crm[`section:${crmSectionKey}`][user?.role];
        return !perm.view;
      }

      return false; // Default visible
    })();

    if (isFieldHidden) return null;

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

    if (field.name === 'fundPercentage') {
      return (
        <div key={field.name} className="form-field">
          <label>{field.label} {field.required ? '*' : ''}</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] !== undefined && formData[field.name] !== null ? formData[field.name] : ''}
              onChange={handleChange}
              required={field.required && !finalDisabled}
              disabled={finalDisabled}
              style={{ ...highlightStyle, paddingRight: '28px', width: '100%' }}
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              color: '#64748b',
              fontWeight: '500',
              pointerEvents: 'none'
            }}>%</span>
          </div>
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
        const crmSectionKey = SECTION_TITLE_MAP[section.title] || section.title.toUpperCase();

        // Check if all fields in this section are hidden
        const visibleFields = section.fields.filter(field => {
          if (user?.role === 'ADMIN') return true;
          const fieldNameLower = field.name.toLowerCase();

          // Field rule view check
          if (dbSettings?.role_permissions?.crm?.[fieldNameLower]?.[user?.role] !== undefined) {
            return dbSettings.role_permissions.crm[fieldNameLower][user?.role].view;
          }

          // Section default rule view check
          if (crmSectionKey && dbSettings?.role_permissions?.crm?.[`section:${crmSectionKey}`]?.[user?.role] !== undefined) {
            return dbSettings.role_permissions.crm[`section:${crmSectionKey}`][user?.role].view;
          }

          return true;
        });

        if (visibleFields.length === 0) return null;

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
