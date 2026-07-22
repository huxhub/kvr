import React from 'react';

export default function UserTable({
  users,
  currentPage,
  loading,
  isReadOnly,
  handleEdit,
  handleDelete
}) {
  return (
    <>
      {/* ── Desktop table (hidden on mobile via CSS) ── */}
      <div className="audit-table-wrapper user-table-desktop">
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '45px', textAlign: 'center', paddingLeft: '16px' }}>#</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              {!isReadOnly && <th style={{ textAlign: 'right', paddingRight: '20px', width: '130px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isReadOnly ? 6 : 7} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={isReadOnly ? 6 : 7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No employees found.</td></tr>
            ) : (
              users.map((u, index) => (
                <tr key={u.username}>
                  <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', paddingLeft: '16px' }}>
                    {(currentPage - 1) * 15 + index + 1}
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                  <td style={{ color: '#334155', fontFamily: 'monospace', fontSize: '0.82rem' }}>{u.username}</td>
                  <td style={{ color: '#64748b' }}>{u.email || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {u.role?.split(',').map(r => r.trim()).map(r => (
                        <span key={r} className="user-badge role" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                          {r.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="user-badge branch" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                      {u.branch || 'All Branches'}
                    </span>
                  </td>
                  {!isReadOnly && (
                    <td style={{ textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button className="btn-edit-mini" onClick={() => handleEdit(u)}>Edit</button>
                        {u.username !== 'admin' && (
                          <button className="btn-danger-mini" onClick={() => handleDelete(u.username)}>Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list (hidden on desktop via CSS) ── */}
      <div className="user-cards-mobile">
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No employees found.</div>
        ) : (
          users.map((u, index) => (
            <div key={u.username} className="user-card">
              <div className="user-card-avatar">
                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="user-card-body">
                <div className="user-card-top">
                  <div>
                    <div className="user-card-name">{u.name}</div>
                    <div className="user-card-sub">@{u.username}{u.email ? ` · ${u.email}` : ''}</div>
                  </div>
                  <span className="user-card-number">#{(currentPage - 1) * 15 + index + 1}</span>
                </div>
                <div className="user-card-badges">
                  {u.role?.split(',').map(r => r.trim()).map(r => (
                    <span key={r} className="user-badge role">{r.replace(/_/g, ' ')}</span>
                  ))}
                  <span className="user-badge branch">{u.branch || 'All Branches'}</span>
                </div>
                {!isReadOnly && (
                  <div className="user-card-actions">
                    <button className="btn-edit-mini" onClick={() => handleEdit(u)}>Edit</button>
                    {u.username !== 'admin' && (
                      <button className="btn-danger-mini" onClick={() => handleDelete(u.username)}>Delete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
