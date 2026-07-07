import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { STATUS_VALUES } from '../../models/apiModel.js';

export default function SectionBlock({ sectionKey, section, formData, handleChange, forceEditable = false }) {
  const { user } = useAuth();
  
  // Logic to determine if section is editable based on user role
  const isEditable = 
    user.role === 'ADMIN' || 
    user.role === 'CRM' ||
    user.role === section.title.replace(' Details', '') ||
    user.role === 'MANAGEMENT'; // MANAGEMENT is handled specifically later for view-only

  const statusField = section.statusField;
  const currentStatus = formData[statusField] || STATUS_VALUES.NOT_ATTENDED;
  
  // Is this section locked entirely? (forceEditable bypasses all lock logic for new bookings; ADMIN/CRM bypasses all lock logic)
  const isLocked = forceEditable ? false : (
    (user.role === 'ADMIN' || user.role === 'CRM') ? false : (!isEditable || currentStatus === STATUS_VALUES.APPROVED || user.role === 'MANAGEMENT' || user.role === 'BILLING')
  );
  
  // For branch manager, only remarks are editable
  const isBranchManager = !forceEditable && user.role === 'BRANCH_MANAGER';
  const lockBadge = forceEditable
    ? <span className="status-badge" style={{ backgroundColor: 'var(--success-green)', color: 'white' }}>Editable</span>
    : isBranchManager && section.fields.some(f => f.name.toLowerCase().includes('remark'))
      ? <span className="status-badge" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>📝 Remarks Editable</span>
      : isLocked
        ? <span className="status-badge" style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-dark)' }}>🔒 Locked</span>
        : <span className="status-badge" style={{ backgroundColor: 'var(--success-green)', color: 'white' }}>Editable</span>;

  return (
    <div className={`form-section ${isLocked && !isBranchManager ? 'locked-section' : ''}`}>
      <div className="section-header">
        <h4 className="section-title">{section.title}</h4>
        {lockBadge}
      </div>
      <div className="section-grid">
        {section.fields.map(field => {
          const isFieldDisabled = 
            (isLocked || (field.name === 'chassisNumber' && !forceEditable)) && 
            !(isBranchManager && field.name.toLowerCase().includes('remark'));
          
          if (field.type === 'status' || field.type === 'select') {
            const options = field.options || Object.values(STATUS_VALUES);
            return (
              <div key={field.name} className="form-field">
                <label>{field.label} {field.required ? '*' : ''}</label>
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required && !isFieldDisabled}
                  disabled={isFieldDisabled}
                >
                  <option value="" disabled>Select Status...</option>
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
                required={field.required && !isFieldDisabled}
                disabled={isFieldDisabled}
                placeholder={field.type === 'text' ? 'Enter details...' : ''}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
