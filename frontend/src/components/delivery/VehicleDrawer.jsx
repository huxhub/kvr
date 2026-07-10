import React, { useState, useEffect } from 'react';
import CrmSectionBlock from './CrmSectionBlock.jsx';
import BookingSectionBlock from './BookingSectionBlock.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { saveVehicle as apiSaveVehicle, createVehicle as apiCreateVehicle } from '../../models/apiModel.js';
import { addAuditLog } from '../../models/auditModel.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function VehicleDrawer({ vehicle, branches, onClose, onSaved, isBookingPage = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({});
  const [auditRemark, setAuditRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isNew = !vehicle || !vehicle.chassisNumber;

  useEffect(() => {
    if (vehicle) {
      setFormData({ ...vehicle });
    } else {
      setFormData({
        branch: user.branch || (branches && branches[0]) || '',
        ca: user.name,
        vehicleStatus: isBookingPage ? 'Booked' : 'Allotted',
        year: new Date().getFullYear(),
      });
    }
    setAuditRemark(isNew ? (isBookingPage ? 'New booking registered' : 'New CRM vehicle registered') : 'Updated vehicle information');
  }, [vehicle, user, branches, isNew, isBookingPage]);

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
      if (isNew) {
        const submissionData = {
          ...formData,
          chassisNumber: formData.chassisNumber || `TEMP-${formData.orderNumber || Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          fuel: formData.fuel || 'Petrol',
          vehicleStatus: formData.vehicleStatus || 'Booked',
          year: formData.year || new Date().getFullYear(),
        };
        await apiCreateVehicle(submissionData, user.role);
        try {
          await addAuditLog({ chassisNumber: submissionData.chassisNumber, customerName: submissionData.customerName, updatedBy: user.role, department: 'Customer Booking', previousStatus: 'None', newStatus: 'Booked', remarks: auditRemark });
        } catch (_) {}
      } else {
        // Backend auto-generates and saves audit entries for all changed fields
        await apiSaveVehicle(formData, user.role, auditRemark);
      }
      showToast('Success', isNew ? 'Booking Created' : 'Changes Saved');
      if (onSaved) onSaved();   // ← refresh shared table state immediately
      onClose();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isViewOnly = user.role === 'MANAGEMENT' || (!isBookingPage && user.role === 'CRM');



  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal-drawer" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h3>{isNew ? (isBookingPage ? 'Register New Booking' : 'CRM Form') : 'Edit Vehicle Booking'}</h3>
            {!isNew && <p style={{ margin: 0, marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>Chassis: {vehicle.chassisNumber}</p>}
          </div>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isBookingPage
            ? <BookingSectionBlock formData={formData} handleChange={handleChange} branches={branches} />
            : <CrmSectionBlock formData={formData} handleChange={handleChange} branches={branches} />
          }
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginLeft: 'auto' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isViewOnly || submitting}>
              {isViewOnly ? 'View-Only Mode' : submitting ? 'Saving...' : isNew ? (isBookingPage ? 'Create Booking' : 'Register Vehicle') : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
