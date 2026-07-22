import React from 'react';

export default function CompanySettings({
  companyBrandingName,
  setCompanyBrandingName,
  companyPhone,
  setCompanyPhone,
  companyEmail,
  setCompanyEmail,
  companyAddress,
  setCompanyAddress,
  handleSaveCompanyDetails
}) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>Company details & branding</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Configure support contact details, addresses, and overall platform branding name.</p>
      
      <form onSubmit={handleSaveCompanyDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Company branding name *</label>
          <input 
            type="text" 
            value={companyBrandingName} 
            onChange={(e) => setCompanyBrandingName(e.target.value)} 
            required 
            style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} 
          />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Support Contact Number</label>
          <input 
            type="text" 
            value={companyPhone} 
            onChange={(e) => setCompanyPhone(e.target.value)} 
            style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} 
          />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Support Email Address</label>
          <input 
            type="email" 
            value={companyEmail} 
            onChange={(e) => setCompanyEmail(e.target.value)} 
            style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif" }} 
          />
        </div>
        <div className="form-field">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Registered Location / Address</label>
          <textarea 
            value={companyAddress} 
            onChange={(e) => setCompanyAddress(e.target.value)} 
            rows="3"
            style={{ borderRadius: '6px', border: '1px solid #cbd5e1', padding: '10px 12px', fontFamily: "'Poppins', sans-serif", fontSize: '0.85rem', resize: 'vertical' }} 
          />
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Save Company Details</button>
      </form>
    </div>
  );
}
