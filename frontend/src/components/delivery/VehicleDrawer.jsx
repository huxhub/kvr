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
        branch: user.branch || (branches && branches[0]) || '',
        ca: user.name,
        vehicleStatus: 'Booked',
        year: new Date().getFullYear(),
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

  // For new bookings: show core details + sales, offers, finance and tma
  const newBookingSections = ['customer', 'vehicle', 'sales', 'offer', 'finance', 'tma'];
  const editSections = Object.keys(SECTIONS);

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
          {isNew ? (
            // New booking form: render specified core sections with forceEditable
            newBookingSections.map(key => (
              <SectionBlock 
                key={key} 
                sectionKey={key} 
                section={SECTIONS[key]} 
                formData={formData} 
                handleChange={handleChange}
                forceEditable={true}
              />
            ))
          ) : (
            // Edit booking form: render all sections based on roles and approval status
            editSections.map(key => (
              <SectionBlock 
                key={key} 
                sectionKey={key} 
                section={SECTIONS[key]} 
                formData={formData} 
                handleChange={handleChange} 
              />
            ))
          )}
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
              {isViewOnly ? 'View-Only Mode' : submitting ? 'Saving...' : isNew ? 'Register Booking' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
