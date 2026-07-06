import React, { useState, useEffect } from 'react';
import { SECTIONS } from '../../models/apiModel.js';
import SectionBlock from './SectionBlock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useVehicles } from '../../hooks/useVehicles.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function NewBookingDrawer({ branches, onClose }) {
  const [formData, setFormData] = useState({});
  const [auditRemark, setAuditRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { createVehicle } = useVehicles();
  const { showToast } = useToast();

  useEffect(() => {
    setFormData({
      branch: user.branch || (branches && branches[0]) || '',
      ca: user.name,
      vehicleStatus: 'Booked',
      year: new Date().getFullYear(),
    });
    setAuditRemark('New booking registered');
  }, [user, branches]);

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
    
    const result = await createVehicle(formData, auditRemark);

    setSubmitting(false);

    if (result.success) {
      showToast('Success', 'Booking Created');
      onClose();
    } else {
      showToast('Error', result.error, 'error');
    }
  };

  const isViewOnly = user.role === 'MANAGEMENT';

  // Only render Customer, Vehicle, and Sales details for New Booking form
  const newBookingSections = ['customer', 'vehicle', 'sales'];

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal-drawer" style={{ maxWidth: '800px' }} onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h3>Register New Booking</h3>
            <p style={{ margin: 0, marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>Enter initial booking details</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {newBookingSections.map(key => (
            <SectionBlock 
              key={key} 
              sectionKey={key} 
              section={SECTIONS[key]} 
              formData={formData} 
              handleChange={handleChange}
              forceEditable={true}
            />
          ))}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginLeft: 'auto' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isViewOnly || submitting}>
              {submitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
