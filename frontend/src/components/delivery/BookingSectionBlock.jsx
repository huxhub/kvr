import React, { useRef, useEffect, useState } from 'react';
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
  // Booking BO Status
  'bostatus': ['CRM'],
  // Booking BO Date
  'bodate':   ['CRM'],

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
  'pl', 'variant', 'colour', 'bostatus', 'bodate',
  'crmbookingstatus', 'ca', 'tl', 'branch', 'region',
  'branchstatus', 'branchremark',
  'financestatus', 'financeremark'
];

// Display order for booking form fields
const BOOKING_FIELD_ORDER = [
  'date', 'customername', 'mobilenumber', 'optyid',
  'pl', 'variant', 'colour',
  'bostatus', 'bodate', 'ordernumber', 'saporderno',
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

const BOOKING_GROUPS = [
  {
    title: 'Customer & Booking Details',
    fields: ['date', 'customername', 'mobilenumber', 'optyid']
  },
  {
    title: 'Vehicle Details',
    fields: ['pl', 'variant', 'colour']
  },
  {
    title: 'Sales & Branch Routing',
    fields: ['ca', 'tl', 'branch', 'region', 'crmbookingstatus']
  },
  {
    title: 'CRM Verification Details',
    fields: ['bostatus', 'bodate', 'ordernumber', 'saporderno']
  },
  {
    title: 'Branch Approval Remarks',
    fields: ['branchstatus', 'branchremark']
  },
  {
    title: 'Finance Status Details',
    fields: ['financestatus', 'financeremark']
  }
];

export default function BookingSectionBlock({ formData, handleChange, forceEditable = true, branches = [] }) {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const [pplOptions, setPplOptions] = useState(['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari']);
  const [isOpen, setIsOpen] = useState(false);
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
        console.error('Failed to load settings in BookingSectionBlock:', err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    async function fetchPpls() {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiBaseUrl}/api/vehicles/ppls`, { credentials: 'include' });
        if (res.ok) {
          const dbPpls = await res.json();
          setPplOptions(prev => {
            const merged = [...new Set([...prev, ...dbPpls])];
            return merged.filter(Boolean);
          });
        }
      } catch (err) {
        console.error('Failed to fetch PPLs:', err);
      }
    }
    fetchPpls();
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

  // Collect all fields from SECTIONS and filter to whitelist
  const allBookingFields = Object.keys(SECTIONS).flatMap(sectionKey => {
    const section = SECTIONS[sectionKey];
    return section.fields.map(field => ({
      ...field,
      sectionKey,
      sectionTitle: section.title
    }));
  })
    .filter(field => BOOKING_FIELD_WHITELIST.includes(field.name.toLowerCase()));

  const isFieldDisabled = (field) => {
    if (formData.crmGenerated) return true;
    const fieldNameLower = field.name.toLowerCase();
    const bookingSectionKey = BOOKING_SECTION_TITLE_MAP[field.sectionTitle];

    // Lock Branch and CRM Booking Status on new booking creation for non-admins (except BOOKING IN-CHARGE)
    const isNewBookingFieldLocked = forceEditable &&
      (field.name === 'crmBookingStatus' || field.name === 'branch') &&
      user?.role !== 'ADMIN' &&
      user?.role !== 'BOOKING IN-CHARGE';

    if (user?.role === 'ADMIN') return false;

    // Check dynamic settings field rule first
    if (dbSettings?.role_permissions?.booking?.[fieldNameLower]?.[user?.role] !== undefined) {
      const perm = dbSettings.role_permissions.booking[fieldNameLower][user?.role];
      return !perm.edit || isNewBookingFieldLocked;
    }

    // Check dynamic settings section default rule next
    if (bookingSectionKey && dbSettings?.role_permissions?.booking?.[`section:${bookingSectionKey}`]?.[user?.role] !== undefined) {
      const perm = dbSettings.role_permissions.booking[`section:${bookingSectionKey}`][user?.role];
      return !perm.edit || isNewBookingFieldLocked;
    }

    // Check field-level override first
    if (BOOKING_FIELD_ACCESS[fieldNameLower]) {
      return !BOOKING_FIELD_ACCESS[fieldNameLower].includes(user?.role) || isNewBookingFieldLocked;
    }

    // Fall back to section-level access
    if (!bookingSectionKey) return true;
    const allowedRoles = BOOKING_SECTION_ACCESS[bookingSectionKey];
    if (!allowedRoles) return true;
    return !allowedRoles.includes(user?.role) || isNewBookingFieldLocked;
  };

  const isFieldHidden = (field) => {
    if (user?.role === 'ADMIN') return false;
    const fieldNameLower = field.name.toLowerCase();
    const bookingSectionKey = BOOKING_SECTION_TITLE_MAP[field.sectionTitle];

    // Check dynamic settings field rule first
    if (dbSettings?.role_permissions?.booking?.[fieldNameLower]?.[user?.role] !== undefined) {
      const perm = dbSettings.role_permissions.booking[fieldNameLower][user?.role];
      return !perm.view;
    }

    // Check dynamic settings section default rule next
    if (bookingSectionKey && dbSettings?.role_permissions?.booking?.[`section:${bookingSectionKey}`]?.[user?.role] !== undefined) {
      const perm = dbSettings.role_permissions.booking[`section:${bookingSectionKey}`][user?.role];
      return !perm.view;
    }

    return false; // Default visible
  };

  const renderBookingField = (field) => {
    const disabledState = isFieldDisabled(field);
    const highlightStyle = getHighlightStyle(disabledState);

    if (field.name === 'pl') {
      return (
        <div key={field.name} className="form-field" style={{ position: 'relative' }}>
          <label>Booking {field.label} {field.required ? '*' : ''}</label>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              required={field.required && !disabledState}
              disabled={disabledState}
              style={{ ...highlightStyle, paddingRight: '36px', width: '100%' }}
              placeholder="Select or type PPL..."
            />
            {!disabledState && (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  position: 'absolute',
                  right: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  height: '32px',
                  width: '32px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            )}
          </div>
          {isOpen && !disabledState && (
            <>
              <div 
                onClick={() => setIsOpen(false)} 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} 
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #003b71',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1001,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  marginTop: '4px',
                  padding: '4px 0'
                }}
              >
                {pplOptions.map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      handleChange({ target: { name: field.name, value: opt } });
                      setIsOpen(false);
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#1e293b',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

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
            required={field.required && !disabledState}
            disabled={disabledState}
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
          required={field.required && !disabledState}
          disabled={disabledState}
          placeholder={field.type === 'text' ? 'Enter details...' : ''}
          style={highlightStyle}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="sections-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {BOOKING_GROUPS.map(group => {
        const groupFields = group.fields.map(fieldName => {
          return allBookingFields.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
        }).filter(Boolean).filter(field => !isFieldHidden(field));

        if (groupFields.length === 0) return null;

        const isGroupLocked = groupFields.every(field => isFieldDisabled(field));

        return (
          <div 
            key={group.title} 
            className="section-card" 
            style={{ 
              background: isGroupLocked ? '#f8fafc' : '#ffffff', 
              border: isGroupLocked ? '1px solid #cbd5e1' : '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '20px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              opacity: isGroupLocked ? 0.85 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: 0, color: isGroupLocked ? '#64748b' : '#1e293b', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {group.title}
              </h4>
              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  fontWeight: '500',
                  background: isGroupLocked ? '#e2e8f0' : '#e0f2fe',
                  color: isGroupLocked ? '#475569' : '#0369a1',
                  border: isGroupLocked ? '1px solid #cbd5e1' : '1px solid #bae6fd'
                }}
              >
                {isGroupLocked ? '🔒 Locked' : '✏️ Editable'}
              </span>
            </div>
            <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
              {groupFields.map(field => renderBookingField(field))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
