import React, { useState, useEffect } from 'react';
import { SECTIONS } from '../../models/apiModel.js';
import SectionBlock from './SectionBlock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useVehicles } from '../../hooks/useVehicles.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function VehicleDrawer({ vehicle, branches, onClose }) {
  const [formData, setFormData] = useState({});
  const [auditRemark, setAuditRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { saveVehicle, createVehicle } = useVehicles();
  const { showToast } = useToast();

  const isNew = !vehicle;

  useEffect(() => {
    if (vehicle) {
      setFormData({ ...vehicle });
    } else {
      setFormData({
        branch: user.branch || 'Perinthalmanna',
        ca: user.name,
        vehicleStatus: 'Booked'
      });
    }
    setAuditRemark('');
  }, [vehicle, user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value ? Number(value) : '') : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    let result;
    if (isNew) {
      result = await createVehicle(formData);
    } else {
      result = await saveVehicle(formData, auditRemark);
    }

    setSubmitting(false);

    if (result.success) {
      showToast('Success', isNew ? 'Booking Created' : 'Changes Saved');
      onClose();
    } else {
      showToast('Error', result.error, 'error');
    }
  };

  const isViewOnly = user.role === 'MANAGEMENT';

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal-drawer" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h3>{isNew ? 'Register New Booking' : 'Edit Vehicle Booking'}</h3>
            {!isNew && <p style={{ margin: 0, marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>Chassis: {vehicle.chassisNumber}</p>}
          </div>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* General Details Section */}
          <div className="form-section-block editable">
            <div className="form-section-header">
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-navy)', fontWeight: 600 }}>General Booking Details</h4>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Chassis Number *</label>
                <input type="text" name="chassisNumber" value={formData.chassisNumber || ''} onChange={handleChange} required disabled={!isNew} />
              </div>
              <div className="form-field">
                <label>Customer Name *</label>
                <input type="text" name="customerName" value={formData.customerName || ''} onChange={handleChange} required disabled={!isNew && user.role !== 'ADMIN' && user.role !== 'CRM'} />
              </div>
              <div className="form-field">
                <label>Mobile Number *</label>
                <input type="text" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} required disabled={!isNew && user.role !== 'ADMIN' && user.role !== 'CRM'} />
              </div>
              <div className="form-field">
                <label>Sales Branch *</label>
                <select 
                  name="branch" 
                  value={formData.branch || ''} 
                  onChange={handleChange} 
                  required 
                  disabled={!isNew && user.role !== 'ADMIN'}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    border: '1px solid #cbd5e1', 
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.85rem',
                    color: '#0f172a',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Department Sections */}
          {!isNew && Object.keys(SECTIONS).map(key => (
            <SectionBlock 
              key={key} 
              sectionKey={key} 
              section={SECTIONS[key]} 
              formData={formData} 
              handleChange={handleChange} 
            />
          ))}
        </div>

        <div className="modal-footer">
          {!isNew && (
            <div className="form-field" style={{ flex: 1, marginRight: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Operation Reason / Audit Remark *</label>
              <input 
                type="text" 
                value={auditRemark} 
                onChange={(e) => setAuditRemark(e.target.value)} 
                required={!isViewOnly} 
                disabled={isViewOnly} 
                placeholder="Describe changes made..." 
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginLeft: 'auto' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isViewOnly || submitting}>
              {isViewOnly ? 'View-Only Mode' : submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
