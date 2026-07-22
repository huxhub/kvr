import React from 'react';

export default function RecentBookingsList({ recentBookings }) {
  return (
    <div className="analytics-card list-card">
      <h3 className="analytics-card-title">Recent Registrations</h3>
      <div className="recent-bookings-list">
        {recentBookings.length > 0 ? (
          recentBookings.map((v, i) => (
            <div key={v.chassisNumber || i} className="recent-booking-item">
              <div className="rb-left">
                <div className="rb-avatar">{v.customerName ? v.customerName.charAt(0).toUpperCase() : '?'}</div>
                <div className="rb-info">
                  <div className="rb-name">{v.customerName || 'Unknown Customer'}</div>
                  <div className="rb-model">{v.pl} {v.variant ? `- ${v.variant}` : ''}</div>
                </div>
              </div>
              <div className="rb-right">
                <div className="rb-date">{v.date || 'No Date'}</div>
                <div className={`rb-status badge-mini ${v.vehicleStatus === 'Delivered' ? 'not-attended' : 'pending'}`}>
                  {v.vehicleStatus || 'Booked'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No recent bookings found.</div>
        )}
      </div>
    </div>
  );
}
