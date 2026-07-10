import React, { useState, useEffect } from 'react';
import BookingSectionBlock from './BookingSectionBlock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { createVehicle as apiCreateVehicle } from '../../models/apiModel.js';
import { addAuditLog } from '../../models/auditModel.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function NewBookingDrawer({ branches, onClose, onSaved }) {
  const [formData, setFormData] = useState({});
  const [auditRemark, setAuditRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
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
    
    try {
      const submissionData = {
        ...formData,
        chassisNumber: formData.chassisNumber || `TEMP-${formData.orderNumber || Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        fuel: formData.fuel || 'Petrol',
        vehicleStatus: formData.vehicleStatus || 'Booked',
        year: formData.year || new Date().getFullYear(),
      };
      await apiCreateVehicle(submissionData, user.role);
      try {
        await addAuditLog({ chassisNumber: submissionData.chassisNumber, customerName: submissionData.customerName, updatedBy: user.role, department: 'Customer Booking', previousStatus: 'None', newStatus: 'Booked', remarks: auditRemark || 'New booking registered' });
      } catch (_) {}
      showToast('Success', 'Booking Created');
      if (onSaved) onSaved();   // ← refresh shared table state immediately
      onClose();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isViewOnly = user.role === 'MANAGEMENT'; // BOOKING IN-CHARGE can create new bookings



  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal-drawer" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h3>Register New Booking</h3>
            <p style={{ margin: 0, marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>Enter initial booking details</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <BookingSectionBlock 
            formData={formData} 
            handleChange={handleChange}
            forceEditable={true}
            branches={branches}
          />
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
