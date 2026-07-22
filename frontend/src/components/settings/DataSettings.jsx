import React from 'react';
import { Download } from 'lucide-react';

export default function DataSettings({
  handleExportExcel,
  handleExportData
}) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>Data Backup & Export</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Export or retrieve vehicle databases for system backups.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: '0.85rem', lineHeight: '1.5' }}>
          <strong>Exporting Data Backup:</strong> Export the entire current vehicle delivery master list either as a raw JSON backup or as a compatibility-friendly Excel CSV spreadsheet.
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleExportExcel}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Download Vehicles Excel Backup
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleExportData}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Download JSON Backup
          </button>
        </div>
      </div>
    </div>
  );
}
