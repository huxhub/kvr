import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function BranchSettings({
  user,
  companyName,
  branches,
  settings,
  newBranchName,
  setNewBranchName,
  customBranches,
  handleAddBranch,
  handleRemoveBranch
}) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px', marginTop: 0 }}>Manage Sales Branches</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px', marginTop: 0 }}>Create and remove customized sales branches for {companyName}.</p>
      
      {user.role === 'ADMIN' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Add Branch Form */}
          <form onSubmit={handleAddBranch} style={{ display: 'flex', gap: '10px', maxWidth: '500px', alignItems: 'flex-end' }}>
            <div className="form-field" style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Add New Branch</label>
              <input 
                type="text" 
                placeholder="e.g. Kozhikode, Palakkad..." 
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                required
                style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: "'Poppins', sans-serif", fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px' }}>
              <Plus size={16} />
              Add Branch
            </button>
          </form>

          {/* Branch Lists */}
          <div style={{ maxWidth: '600px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px', marginTop: 0 }}>Current Branch List</h4>
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
              
              {/* Custom branches */}
              {customBranches.map(b => (
                <div key={b} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: '#ffffff' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{b}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveBranch(b)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                    title="Remove Branch"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {customBranches.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', background: '#ffffff' }}>
                  No custom branches added yet. Use the field above to add one.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
          Only Administrator accounts have permission to configure and manage sales branches.
        </div>
      )}
    </div>
  );
}
