import React from 'react';
import { calculateCardBorderClass, calculateProgress, getPendingDepartment } from '../../utils/vehicleUtils.js';

export default function DeliveryGridItem({ vehicle, openDrawer, index }) {
  const borderClass = calculateCardBorderClass(vehicle);
  const progress = calculateProgress(vehicle);
  const pendingDept = getPendingDepartment(vehicle);

  return (
    <div className={`vehicle-card ${borderClass}`} onClick={() => openDrawer(vehicle)}>
      <div className="card-header-info">
        <div className="card-title-group">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', background: 'var(--border-light)', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>#{index}</span>
            {vehicle.customerName}
          </h4>
          <div className="card-subtitle">{vehicle.pl} {vehicle.variant}</div>
        </div>
        <span className="vehicle-status-badge">{vehicle.vehicleStatus}</span>
      </div>
      
      <div className="card-details-grid">
        <div className="card-detail-item">
          <span className="card-detail-label">Mobile</span>
          <span className="card-detail-value">{vehicle.mobileNumber}</span>
        </div>
        <div className="card-detail-item">
          <span className="card-detail-label">Branch</span>
          <span className="card-detail-value">{vehicle.branch || 'Perinthalmanna'}</span>
        </div>
        <div className="card-detail-item">
          <span className="card-detail-label">Advisor (CA)</span>
          <span className="card-detail-value">{vehicle.ca}</span>
        </div>
        <div className="card-detail-item">
          <span className="card-detail-label">Team Leader (TL)</span>
          <span className="card-detail-value">{vehicle.tl}</span>
        </div>
        <div className="card-detail-item" style={{ gridColumn: '1/-1' }}>
          <span className="card-detail-label">Expected Delivery</span>
          <span className="card-detail-value">{vehicle.expectedDeliveryDate || 'Not Scheduled'}</span>
        </div>
      </div>
      
      <div className="card-progress-section">
        <div className="progress-label-bar">
          <span>Workflow Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div className={`progress-bar-fill ${progress === 100 ? 'all-approved' : ''}`} style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="card-pending-dept-wrapper">
          <span className="pending-dept-label">Current Pipeline:</span>
          <span className={`pending-dept-value ${pendingDept.status.toLowerCase().replace(' ', '-')}`}>
            {pendingDept.name} ({pendingDept.status})
          </span>
        </div>
      </div>
    </div>
  );
}
