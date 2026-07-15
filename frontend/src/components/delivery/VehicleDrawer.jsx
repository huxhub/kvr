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
  const [crmChassisNumber, setCrmChassisNumber] = useState('');

  const isNew = !vehicle || !vehicle.chassisNumber;

  const checkBookingFieldsFilled = (data) => {
    const fields = [
      'date', 'customerName', 'mobileNumber', 'optyId',
      'pl', 'variant', 'colour', 'ca', 'tl', 'branch', 'region',
      'orderNumber', 'sapOrderNo'
    ];
    return fields.every(f => data[f] !== undefined && data[f] !== null && String(data[f]).trim() !== '');
  };

  const handleGenerateCrm = async () => {
    if (!crmChassisNumber.trim()) return;
    setSubmitting(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBaseUrl}/api/vehicles/generate-crm`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': user.role
        },
        body: JSON.stringify({
          originalChassisNumber: vehicle.chassisNumber,
          newChassisNumber: crmChassisNumber.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate CRM entry');
      }

      showToast('Success', 'CRM Delivery Entry Generated and Booking Locked');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
    setFormData(prev => {
      const updated = { 
        ...prev, 
        [name]: type === 'number' ? (value ? Number(value) : '') : value 
      };

      if (name === 'onRoadPrice' || name === 'ip' || name === 'loanAmount') {
        const onRoad = Number(updated.onRoadPrice) || 0;
        const ip = Number(updated.ip) || 0;
        const loan = Number(updated.loanAmount) || 0;

        const balance = onRoad - (ip + loan);
        updated.balanceAmount = balance;

        if (onRoad > 0) {
          updated.fundPercentage = parseFloat(((loan / onRoad) * 100).toFixed(2));
        } else {
          updated.fundPercentage = 0;
        }
      }

      return updated;
    });
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
        await apiSaveVehicle(formData, user.role, auditRemark, vehicle.chassisNumber);
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
            {!isNew && !isBookingPage && (
              <p style={{ margin: 0, marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                Chassis: {crmChassisNumber || formData.realChassisNumber || formData.chassisNumber || vehicle.chassisNumber}
              </p>
            )}
          </div>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isBookingPage
            ? <BookingSectionBlock formData={formData} handleChange={handleChange} branches={branches} />
            : <CrmSectionBlock formData={formData} handleChange={handleChange} branches={branches} />
          }

          {isBookingPage && !isNew && user?.role === 'CRM' && (user?.branch === 'All Branches' || user?.branch === vehicle?.branch) && !formData.crmGenerated && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: 0, marginBottom: '12px', color: 'var(--primary-navy)', fontSize: '0.95rem' }}>Generate CRM Delivery Entry</h4>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Real Chassis Number *</label>
                  <input
                    type="text"
                    value={crmChassisNumber}
                    onChange={(e) => setCrmChassisNumber(e.target.value.toUpperCase())}
                    placeholder="Enter real chassis number..."
                    style={{
                      padding: '8px 12px',
                      border: '1.5px solid #003b71',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <button
                  type="button"
                  disabled={!checkBookingFieldsFilled(formData) || !crmChassisNumber.trim() || submitting}
                  onClick={handleGenerateCrm}
                  className="btn-primary"
                  style={{ height: '38px' }}
                >
                  {submitting ? 'Generating...' : 'Generate CRM'}
                </button>
              </div>
              {!checkBookingFieldsFilled(formData) && (
                <p style={{ margin: 0, marginTop: '8px', fontSize: '0.8rem', color: '#ef4444' }}>
                  ⚠️ Fill all booking fields (Customer details, Vehicle details, routing & order numbers) to enable generation.
                </p>
              )}
            </div>
          )}

          {isBookingPage && !!formData.crmGenerated && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#15803d' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              CRM Delivery Entry generated. This booking is locked and cannot be edited.
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginLeft: 'auto' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isViewOnly || submitting || !!formData.crmGenerated}>
              {isViewOnly ? 'View-Only Mode' : formData.crmGenerated ? 'Booking Locked' : submitting ? 'Saving...' : isNew ? (isBookingPage ? 'Create Booking' : 'Register Vehicle') : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
