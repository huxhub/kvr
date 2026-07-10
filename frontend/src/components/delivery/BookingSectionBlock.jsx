import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { STATUS_VALUES, SECTIONS } from '../../models/apiModel.js';

// ============================================================
// BOOKING FORM — ROLE-BASED ACCESS CONTROL CONFIGURATION
// ============================================================
// To grant a role access to a field: add the role name to that field's array below.
// Fields not listed here use the parent section's default access from BOOKING_SECTION_ACCESS.

// Section-level access: controls which roles can edit fields in each section
const BOOKING_SECTION_ACCESS = {
  'BOOKING CUSTOMER': ['BOOKING IN-CHARGE', 'CRM'],  // Booking Customer Details
  'BOOKING VEHICLE':  ['BOOKING IN-CHARGE', 'CRM'],  // Booking Vehicle Details
  'BOOKING SALES':    ['BOOKING IN-CHARGE', 'CRM'],  // Booking Sales Details
  'BOOKING OFFER':    ['BOOKING IN-CHARGE', 'CRM'],  // Booking Offer Details
  'BOOKING FINANCE':  ['FINANCE'],                                                 // Booking Finance Details
};

// Field-level access: add ONLY fields that need different access than their section div default
const BOOKING_FIELD_ACCESS = {

  // ── Booking Customer Details ──
  // Booking Date
  'date':         ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking Customer Name
  'customername': ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking Mobile Number
  'mobilenumber': ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking OPTY ID
  'optyid':       ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking Order Number (BKG ORDER NO) — only CRM can edit
  'ordernumber':  ['CRM'],
  // Booking SAP Order No
  'saporderno':   ['CRM'],

  // ── Booking Vehicle Details ──
  // Booking PPL (Product Line)
  'pl':       ['BOOKING IN-CHARGE',  'BRANCH'],
  // Booking Variant
  'variant':  ['BOOKING IN-CHARGE',  'BRANCH'],
  // Booking Color
  'colour':   ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking BD Status
  'bdstatus': ['CRM'],
  // Booking BD Date
  'bddate':   ['CRM'],

  // ── Booking Sales Details ──
  // Booking CA (Customer Advisor)
  'ca':     ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking TL (Team Leader)
  'tl':     ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking Branch — LOCKED on new booking for non-admin (handled by isNewBookingFieldLocked)
  'branch': ['BOOKING IN-CHARGE'],
  // Booking Region
  'region': ['BOOKING IN-CHARGE', 'BRANCH'],
  // Booking CRM Booking Status — LOCKED on new booking for non-admin (handled by isNewBookingFieldLocked)
  'crmbookingstatus': ['BOOKING IN-CHARGE'],
  // Booking Branch Status
  'branchstatus': ['BRANCH_MANAGER', 'BRANCH'],
  // Booking Branch Remark
  'branchremark': ['BRANCH_MANAGER', 'BRANCH'],

  // ── Booking Finance Details ──
  // Booking Finance Status
  'financestatus': ['FINANCE'],
  // Booking Finance Remark
  'financeremark': ['FINANCE'],
  // All other finance fields use section default ['FINANCE']
};

// Fields shown in the booking form (whitelist from all SECTIONS)
const BOOKING_FIELD_WHITELIST = [
  'date', 'customername', 'mobilenumber', 'optyid',
  'ordernumber', 'saporderno',
  'pl', 'variant', 'colour', 'bdstatus', 'bddate',
  'crmbookingstatus', 'ca', 'tl', 'branch', 'region',
  'branchstatus', 'branchremark',
  'financestatus', 'financeremark'
];

// Display order for booking form fields
const BOOKING_FIELD_ORDER = [
  'date', 'customername', 'mobilenumber', 'optyid',
  'pl', 'variant', 'colour',
  'bdstatus', 'bddate', 'ordernumber', 'saporderno',
  'crmbookingstatus', 'ca', 'tl',
  'branch', 'region', 'branchstatus', 'branchremark',
  'financestatus', 'financeremark'
];

// Map original section titles to Booking section keys
const BOOKING_SECTION_TITLE_MAP = {
  'Customer Details': 'BOOKING CUSTOMER',
  'Vehicle Details':  'BOOKING VEHICLE',
  'Sales Details':    'BOOKING SALES',
  'Offer Details':    'BOOKING OFFER',
  'Finance Details':  'BOOKING FINANCE',
};

export default function BookingSectionBlock({ formData, handleChange, forceEditable = true, branches = [] }) {
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

  // Collect all fields from SECTIONS, filter to whitelist, then sort
  const allBookingFields = Object.keys(SECTIONS).flatMap(sectionKey => {
    const section = SECTIONS[sectionKey];
    return section.fields.map(field => ({
      ...field,
      sectionKey,
      sectionTitle: section.title
    }));
  })
    .filter(field => BOOKING_FIELD_WHITELIST.includes(field.name.toLowerCase()))
    .sort((a, b) => {
      const idxA = BOOKING_FIELD_ORDER.indexOf(a.name.toLowerCase());
      const idxB = BOOKING_FIELD_ORDER.indexOf(b.name.toLowerCase());
      return idxA - idxB;
    });

  const renderBookingField = (field) => {
    const fieldNameLower = field.name.toLowerCase();
    const bookingSectionKey = BOOKING_SECTION_TITLE_MAP[field.sectionTitle];

    // Lock Branch and CRM Booking Status on new booking creation for non-admins (except BOOKING IN-CHARGE)
    const isNewBookingFieldLocked = forceEditable &&
      (field.name === 'crmBookingStatus' || field.name === 'branch') &&
      user?.role !== 'ADMIN' &&
      user?.role !== 'BOOKING IN-CHARGE';

    const isFieldDisabled = isNewBookingFieldLocked || (() => {
      if (user?.role === 'ADMIN') return false;

      // Check field-level override first
      if (BOOKING_FIELD_ACCESS[fieldNameLower]) {
        return !BOOKING_FIELD_ACCESS[fieldNameLower].includes(user?.role);
      }

      // Fall back to section-level access
      if (!bookingSectionKey) return true;
      const allowedRoles = BOOKING_SECTION_ACCESS[bookingSectionKey];
      if (!allowedRoles) return true;
      return !allowedRoles.includes(user?.role);
    })();

    const highlightStyle = getHighlightStyle(isFieldDisabled);

    if (field.type === 'status' || field.type === 'select' || field.name === 'branch') {
      let options = field.options || Object.values(STATUS_VALUES);
      if (field.name === 'branch') options = branches;
      return (
        <div key={field.name} className="form-field">
          <label>Booking {field.label} {field.required ? '*' : ''}</label>
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required && !isFieldDisabled}
            disabled={isFieldDisabled}
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
        <label>Booking {field.label} {field.required ? '*' : ''}</label>
        <input
          type={field.type}
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
          required={field.required && !isFieldDisabled}
          disabled={isFieldDisabled}
          placeholder={field.type === 'text' ? 'Enter details...' : ''}
          style={highlightStyle}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', padding: '10px 0' }}>
      {allBookingFields.map(field => renderBookingField(field))}
    </div>
  );
}
